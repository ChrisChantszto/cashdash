import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, Text, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function FeedbackScreen() {
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const navigation = useNavigation<any>();

  const renderStar = (index: number) => {
    const filled = index <= rating;
    return (
      <TouchableOpacity key={index} onPress={() => setRating(index)}>
        <FontAwesome name={filled ? 'star' : 'star-o'} size={28} color={filled ? '#f4b400' : '#a1887f'} style={styles.star} />
      </TouchableOpacity>
    );
  };

  const canSubmit = rating > 0 || feedback.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Add feedback', 'Please rate or leave a message before submitting.');
      return;
    }
    // Placeholder submission. Hook up to backend later if desired.
    try {
      // TODO: POST to server when endpoint is available
      // await fetch(`${API_URL}/feedback`, { method: 'POST', body: JSON.stringify({ rating, feedback }) });
      Alert.alert('Thank you!', 'Your feedback has been submitted.');
      setRating(0);
      setFeedback('');
    } catch (e) {
      Alert.alert('Submission failed', 'Please try again later.');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Rate Cashly</ThemedText>
      <ThemedText style={styles.subtitle}>
        Share your feedback with the developer to help improve Cashly and your experience.
      </ThemedText>

      <View style={styles.card}>
        <ThemedText style={styles.sectionLabel}>Your rating</ThemedText>
        <View style={styles.starsRow}>
          {[1,2,3,4,5].map(renderStar)}
        </View>

        <ThemedText style={[styles.sectionLabel, { marginTop: 16 }]}>Feedback, suggestions, questions</ThemedText>
        <TextInput
          style={styles.textArea}
          placeholder="Type here..."
          placeholderTextColor="#a1887f"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={6}
        />
      </View>

      <TouchableOpacity style={styles.faqButton} onPress={() => navigation.navigate('HelpSupport')}>
        <Text style={styles.faqButtonText}>FAQ</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && { opacity: 0.5 }]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f4e9',
    padding: 24,
  },
  title: {
    color: '#5d4037',
    marginBottom: 6,
  },
  subtitle: {
    color: '#8d6e63',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#eee0d8',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionLabel: {
    color: '#5d4037',
    fontWeight: '600',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  star: {
    marginRight: 8,
  },
  textArea: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d7ccc8',
    padding: 12,
    color: '#5d4037',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  faqButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    backgroundColor: '#8d6e63',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  faqButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 12,
    alignSelf: 'stretch',
    backgroundColor: '#5d4037',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
