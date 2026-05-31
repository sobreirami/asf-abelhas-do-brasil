import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

interface HoneycombPatternProps {
  opacity?: number;
  color?: string;
}

const HEX_SIZE = 28;
const HEX_H = HEX_SIZE * 0.866;
const COLS = 10;
const ROWS = 8;

export default function HoneycombPattern({
  opacity = 0.07,
  color = '#FFC53D',
}: HoneycombPatternProps) {
  const hexagons = useMemo(() => {
    const items: { x: number; y: number; key: string }[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const offsetX = row % 2 === 0 ? 0 : HEX_SIZE * 0.75;
        items.push({
          x: col * HEX_SIZE * 1.5 + offsetX,
          y: row * HEX_H,
          key: `${row}-${col}`,
        });
      }
    }
    return items;
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {hexagons.map((h) => (
        <View
          key={h.key}
          style={[
            styles.hex,
            {
              left: h.x,
              top: h.y,
              borderColor: color,
              opacity,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    inset: 0,
    overflow: 'hidden',
  },
  hex: {
    position: 'absolute',
    width: HEX_SIZE,
    height: HEX_SIZE,
    borderRadius: 6,
    borderWidth: 1.5,
    transform: [{ rotate: '30deg' }],
  },
});
