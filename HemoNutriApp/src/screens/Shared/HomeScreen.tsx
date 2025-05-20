import React from 'react';
import { View, Text, StyleSheet, Alert, ImageBackground, Dimensions, ScrollView, TouchableOpacity } from 'react-native';
import { Button } from '@rneui/themed';
import { useColors } from '../../theme/ThemeContext'; // Updated import

const heroImage = require('../../../assets/hero-image.jpg');

interface Props {
  navigation: any;
}

const { height } = Dimensions.get('window');

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useColors(); // Use the hook to get dynamic colors

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <ImageBackground
        source={heroImage}
        style={[styles.heroSection, { height: height * 0.8 }]}
        resizeMode="cover"
        onError={(error) => {
          console.error('ImageBackground error:', error.nativeEvent.error);
          Alert.alert('Image Load Error', 'Failed to load the hero image. Please check the image path.');
        }}
        accessibilityLabel="Hero image background"
      >
        <View style={styles.overlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Welcome to HemoNutri</Text>
          <Text style={styles.heroSubtitle}>
            Your partner in managing nutrition and wellness with ease.
          </Text>
          <Button
            title="Get Started"
            onPress={() => navigation.navigate('Login')}
            buttonStyle={[styles.heroButton, { backgroundColor: colors.primary }]}
            containerStyle={styles.heroButtonContainer}
            titleStyle={styles.heroButtonTitle}
            accessibilityLabel="Get started button"
          />
        </View>
      </ImageBackground>

      <View style={styles.featuresSection}>
        <Text style={[styles.sectionTitle, { color: colors.primary }]}>Why Choose HemoNutri?</Text>
        <View style={styles.featuresGrid}>
          <View style={[styles.featureCard, { backgroundColor: colors.secondary }]}>
            <Text style={styles.featureIcon}>🍎</Text>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
              Track Your Nutrition
            </Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Log food and fluid intake effortlessly to stay on top of your health.
            </Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: colors.secondary }]}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
              Learn & Grow
            </Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Access educational resources tailored to your needs.
            </Text>
          </View>
          <View style={[styles.featureCard, { backgroundColor: colors.secondary }]}>
            <Text style={styles.featureIcon}>👩‍⚕️</Text>
            <Text style={[styles.featureTitle, { color: colors.textPrimary }]}>
              Connect with Providers
            </Text>
            <Text style={[styles.featureDescription, { color: colors.textSecondary }]}>
              Collaborate with healthcare professionals for personalized care.
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { backgroundColor: colors.primary }]}>
        <Text style={styles.footerText}>© {new Date().getFullYear()} HemoNutri. All rights reserved.</Text>
        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => Alert.alert('About', 'Learn more about HemoNutri.')}
            accessibilityLabel="About link"
          >
            <Text style={styles.footerLink}>About</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => Alert.alert('Contact', 'Get in touch with us.')}
            accessibilityLabel="Contact link"
          >
            <Text style={styles.footerLink}>Contact</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  heroContent: {
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 24,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 24,
  },
  heroButtonContainer: {
    width: '60%',
  },
  heroButton: {
    borderRadius: 9999,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  heroButtonTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuresSection: {
    paddingVertical: 64,
    backgroundColor: '#fff', // Static color for contrast; can be made dynamic if needed
  },
  sectionTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 48,
  },
  featuresGrid: {
    paddingHorizontal: 16,
    flexDirection: 'column',
    gap: 32,
  },
  featureCard: {
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    textAlign: 'center',
  },
  footer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#fff',
    fontSize: 14,
  },
  footerLinks: {
    flexDirection: 'row',
    marginTop: 8,
  },
  footerLink: {
    color: '#fff',
    fontSize: 14,
    marginHorizontal: 8,
    textDecorationLine: 'underline',
  },
});

export default HomeScreen;