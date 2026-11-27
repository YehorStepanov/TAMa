import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { AddressLink } from '@/components/AddressLink';
import { SmallButton } from '@/components/SmallButton';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes, r } from '@/theme';

// La mappa usa OpenStreetMap (con Leaflet dentro una pagina web): non serve nessuna chiave di Google.
// I tipi di react-native-webview non vanno d'accordo con quelli di React: lo uso senza controllo dei tipi.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WebView = RNWebView as any;

const HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#map{height:100%;margin:0;background:#E9EBF3}
.pin{width:44px;height:44px;border-radius:22px;background:#fff;border:3px solid #9AA8BA;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.pin.mine{border-color:#4B5FC9}
.pin.sel{border-color:#4B5FC9;border-width:5px;transform:scale(1.15)}
</style></head><body><div id="map"></div><script>
var map=L.map('map',{zoomControl:false}).setView([49.1951,16.6068],12);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
var layer=L.layerGroup().addTo(map);
function post(m){window.ReactNativeWebView.postMessage(m)}
function setEvents(list,selectedId){
  layer.clearLayers();
  list.forEach(function(e){
    var cls='pin'+(e.mine?' mine':'')+(e.id===selectedId?' sel':'');
    var icon=L.divIcon({className:'',html:'<div class="'+cls+'">'+e.emoji+'</div>',iconSize:[44,44],iconAnchor:[22,22]});
    L.marker([e.lat,e.lng],{icon:icon}).on('click',function(){post(e.id)}).addTo(layer);
  });
}
map.on('click',function(){post('')});
post('ready');
</script></body></html>`;

// La mappa degli eventi (Brno): un segnaposto per evento; toccandolo compare una scheda in basso.
export function EventsMap() {
  const router = useRouter();
  const { visibleEvents, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const web = useRef<any>(null);
  const selected = visibleEvents.find((e) => e.id === selectedId);

  useEffect(() => {
    if (!ready) return;
    const list = visibleEvents
      .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng))
      .map((e) => ({ id: e.id, lat: e.lat, lng: e.lng, emoji: e.emoji, mine: isOnMyPage(e.id) }));
    web.current?.injectJavaScript(`setEvents(${JSON.stringify(list)}, ${JSON.stringify(selectedId)}); true;`);
  }, [ready, visibleEvents, selectedId, isOnMyPage]);

  return (
    <View style={styles.wrap}>
      <WebView
        ref={web}
        style={styles.map}
        originWhitelist={['*']}
        source={{ html: HTML }}
        javaScriptEnabled
        onMessage={(e: { nativeEvent: { data: string } }) => {
          const msg = e.nativeEvent.data;
          if (msg === 'ready') setReady(true);
          else setSelectedId(msg || null);
        }}
      />
      {selected && (
        <View style={styles.sheet}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle} onPress={() => router.push({ pathname: '/mission', params: { id: selected.id } })}>
              {selected.emoji} {selected.title}
            </Text>
            <Text style={styles.sheetLine}>
              {selected.day} · {selected.time}
            </Text>
            <AddressLink address={selected.address} label={selected.place} />
          </View>
          {isOnMyPage(selected.id) ? (
            <SmallButton tone="remove" label="Remove" accessibilityLabel={`Remove ${selected.title} from my calendar`} onPress={() => removeFromMyPage(selected.id)} />
          ) : (
            <SmallButton label="Add" accessibilityLabel={`Add ${selected.title} to my calendar`} onPress={() => addToMyPage(selected.id)} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, marginHorizontal: sizes.margin, marginBottom: 6, borderRadius: r(28), overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder },
  map: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    backgroundColor: colors.surface,
    borderRadius: r(sizes.radius),
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.gap,
    elevation: 6,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sheetLine: { fontSize: 14, color: colors.muted, marginTop: 2 },
});
