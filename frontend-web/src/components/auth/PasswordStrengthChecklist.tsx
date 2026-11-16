// src/components/auth/PasswordStrengthChecklist.tsx
'use client';

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { PasswordRuleStatus } from './passwordRules';
import { useAppTheme } from '@/theme/ThemeContext';

export interface PasswordStrengthChecklistProps {
  password: string;
  rules: PasswordRuleStatus[];
}

export const PasswordStrengthChecklist: React.FC<PasswordStrengthChecklistProps> = React.memo(
  ({ password, rules }) => {
    const { theme } = useAppTheme();
    const { colors, primitives } = theme;

    const passedCount = useMemo(
      () => rules.filter((rule) => rule.valid).length,
      [rules]
    );

    const strengthMeta = useMemo(() => {
      if (passedCount <= 2) return { color: primitives.color_red_500, label: 'Faible' };
      if (passedCount < rules.length) {
        return { color: primitives.color_orange_500, label: 'Moyen' };
      }
      return { color: primitives.color_green_500, label: 'Robuste' };
    }, [passedCount, rules.length, primitives]);

    return (
      <View>
        {password.length > 0 && (
          <View style={styles.strengthContainer}>
            <View
              style={[
                styles.strengthBarBackground,
                { backgroundColor: colors['colors_bg_primary'] },
              ]}
            >
              <View
                style={[
                  styles.strengthBarFill,
                  {
                    width: `${(passedCount / rules.length) * 100}%`,
                    backgroundColor: strengthMeta.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.strengthLabel, { color: strengthMeta.color }]}>
              {strengthMeta.label}
            </Text>
          </View>
        )}

        <View style={styles.rulesList}>
          {rules.map((rule) => (
            <View key={rule.id} style={styles.ruleItem}>
              <Text
                style={[
                  styles.ruleIcon,
                  {
                    color: rule.valid
                      ? primitives.color_green_500
                      : colors['colors_text_secondary'],
                  },
                ]}
              >
                {rule.valid ? '✓' : '•'}
              </Text>
              <Text
                style={[
                  styles.ruleText,
                  {
                    color: rule.valid
                      ? colors['colors_text_primary']
                      : colors['colors_text_secondary'],
                  },
                ]}
              >
                {rule.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
);
PasswordStrengthChecklist.displayName = 'PasswordStrengthChecklist';

const styles = StyleSheet.create({
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
    marginBottom: 6,
  },
  strengthBarBackground: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 11,
    fontWeight: '600',
    minWidth: 48,
    textAlign: 'right',
  },
  rulesList: {
    paddingHorizontal: 4,
    marginVertical: 4,
    gap: 4,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ruleIcon: {
    fontSize: 12,
    fontWeight: 'bold',
    width: 14,
  },
  ruleText: {
    fontSize: 12,
    lineHeight: 16,
  },
});

export default PasswordStrengthChecklist;
