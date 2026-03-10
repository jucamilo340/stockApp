import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  SYMBOL_SOURCE_OPTIONS,
  SymbolSource,
} from '@utils/symbolSources';

interface SymbolSourceDropdownProps {
  value: SymbolSource;
  onChange: (value: SymbolSource) => void;
}

export default function SymbolSourceDropdown({
  value,
  onChange,
}: SymbolSourceDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption =
    SYMBOL_SOURCE_OPTIONS.find((option) => option.value === value) ??
    SYMBOL_SOURCE_OPTIONS[0];

  const handleSelect = (nextValue: SymbolSource) => {
    onChange(nextValue);
    setIsOpen(false);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.dropdown}>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.trigger}
          onPress={() => setIsOpen((current) => !current)}
        >
          <Text style={styles.triggerText}>{selectedOption.label}</Text>
          <Text style={styles.chevron}>{isOpen ? '^' : 'v'}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.menu}>
            {SYMBOL_SOURCE_OPTIONS.map((option) => {
              const isSelected = option.value === value;

              return (
                <TouchableOpacity
                  key={option.value}
                  activeOpacity={0.85}
                  style={[
                    styles.option,
                    isSelected && styles.optionSelected,
                  ]}
                  onPress={() => handleSelect(option.value)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    zIndex: 20,
    minWidth: 150,
  },
  label: {
    fontSize: 11,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
    textAlign: 'right',
  },
  dropdown: {
    position: 'relative',
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#151522',
    borderWidth: 1,
    borderColor: '#2A2A3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  triggerText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    color: '#00C805',
    fontSize: 12,
    marginLeft: 8,
  },
  menu: {
    position: 'absolute',
    top: 50,
    right: 0,
    left: 0,
    backgroundColor: '#151522',
    borderWidth: 1,
    borderColor: '#2A2A3A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  optionSelected: {
    backgroundColor: '#00C80522',
  },
  optionText: {
    color: '#BBB',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#00C805',
    fontWeight: '700',
  },
});
