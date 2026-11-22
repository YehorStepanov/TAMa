import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView as RNWebView } from 'react-native-webview';
import { AddressLink } from '@/components/AddressLink';
import { SmallButton } from '@/components/SmallButton';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

// La mappa usa OpenStreetMap (con Leaflet dentro una pagina web): non serve nessuna chiave di Google.
// Centro di Brno: per ora la mappa parte sempre da qui.
// I tipi di react-native-webview non vanno d'accordo con quelli di React: lo uso senza controllo dei tipi.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const WebView = RNWebView as any;

const HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html,body,#map{height:100%;margin:0;background:#E9EBE7}
.pin{width:44px;height:44px;border-radius:22px;background:#fff;border:3px solid #B9C3C1;display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 2px 6px rgba(0,0,0,.25)}
.pin.mine{border-color:#B4532A}
.pin.sel{border-color:#B4532A;border-width:5px;transform:scale(1.15)}
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

export default function MapScreen() {
  const { visibleEvents, isOnMyPage, addToMyPage, removeFromMyPage } = useEvents();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const web = useRef<any>(null);
  const selected = visibleEvents.find((e) => e.id === selectedId);

  // Ogni volta che cambiano gli eventi o la selezione, aggiorno i segnaposto nella mappa.
  useEffect(() => {
    if (!ready) return;
    const list = visibleEvents
      .filter((e) => Number.isFinite(e.lat) && Number.isFinite(e.lng))
      .map((e) => ({ id: e.id, lat: e.lat, lng: e.lng, emoji: e.emoji, mine: isOnMyPage(e.id) }));
    web.current?.injectJavaScript(`setEvents(${JSON.stringify(list)}, ${JSON.stringify(selectedId)}); true;`);
  }, [ready, visibleEvents, selectedId, isOnMyPage]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>Events in Brno · tap a pin</Text>
      </View>

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
            <Text style={styles.sheetTitle}>
              {selected.emoji} {selected.title}
            </Text>
            <Text style={styles.sheetLine}>
              {selected.day} · {selected.time} · {selected.place}
            </Text>
            <AddressLink address={selected.address} />
          </View>
          {isOnMyPage(selected.id) ? (
            <SmallButton tone="remove" label="Remove" accessibilityLabel={`Remove ${selected.title} from my page`} onPress={() => removeFromMyPage(selected.id)} />
          ) : (
            <SmallButton label="Add" accessibilityLabel={`Add ${selected.title} to my page`} onPress={() => addToMyPage(selected.id)} />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: sizes.margin, paddingTop: 16, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 2 },
  map: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: sizes.margin,
    right: sizes.margin,
    bottom: 16,
    backgroundColor: colors.surface,
    borderRadius: sizes.radius,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: sizes.gap,
    elevation: 6,
  },
  sheetTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  sheetLine: { fontSize: 14, color: colors.muted, marginTop: 2 },
});
