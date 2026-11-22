import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AppButton } from '@/components/AppButton';
import { ListSkeleton, PosterSkeleton } from '@/components/Skeleton';
import { useEvents } from '@/context/EventsContext';
import { colors, sizes } from '@/theme';

// Caricamento con segnaposto (skeleton) invece della rotellina, e errori con "Try again".
// Il segnaposto compare solo se l'attesa supera ~0,7 secondi (sotto la soglia crea solo confusione),
// e dopo qualche secondo spiega che il server si sta svegliando.
export function ServerStatus({ variant = 'list' }: { variant?: 'poster' | 'list' }) {
  const { loading, error, reload } = useEvents();
  const [show, setShow] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!loading) {
      setShow(false);
      setSlow(false);
      return;
    }
    const a = setTimeout(() => setShow(true), 700);
    const b = setTimeout(() => setSlow(true), 6000);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [loading]);

  if (loading) {
    return (
      <View>
        {show ? variant === 'poster' ? <PosterSkeleton /> : <ListSkeleton /> : null}
        {slow ? (
          <Text style={styles.small}>Waking up the server… the first time can take up to a minute.</Text>
        ) : null}
      </View>
    );
  }
  if (error) {
    return (
      <View style={styles.box}>
        <Text style={styles.text}>{error}</Text>
        <AppButton label="Try again" onPress={reload} />
      </View>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  box: { marginTop: 24, alignItems: 'center', gap: 12, paddingHorizontal: sizes.margin },
  text: { fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' },
  small: { fontSize: 14, color: colors.muted, textAlign: 'center', marginTop: 16, paddingHorizontal: sizes.margin },
});
