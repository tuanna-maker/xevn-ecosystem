import React from 'react';

import { StyleSheet, Text, View, type TextStyle } from 'react-native';

import { textStyles } from '../../theme/tokens';



type DetailRowProps = {

  label: string;

  value: string;

  /** Financial / numeric values — tabular-nums per DS §1 */

  numeric?: boolean;

};



export function DetailRow({ label, value, numeric = false }: DetailRowProps) {

  return (

    <View style={styles.row}>

      <Text style={styles.label}>{label}</Text>

      <Text
        style={[
          styles.value,
          numeric && { fontVariant: ['tabular-nums'], fontWeight: textStyles.tabularAmount.fontWeight },
        ]}
      >
        {value}
      </Text>

    </View>

  );

}



const styles = StyleSheet.create({

  row: { gap: 4 },

  label: textStyles.footnoteLabel as TextStyle,

  value: textStyles.bodyValue as TextStyle,

});


