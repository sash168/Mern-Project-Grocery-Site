import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import WhiteArrowIcon from '../../assets/white_arrow_icon.svg';
import BlackArrowIcon from '../../assets/black_arrow_icon.svg';


// ✅ Import images directly using require
const assets = {
  main_banner_bg: require('../../assets/main_banner_bg.png'),
  main_banner_bg_sm: require('../../assets/main_banner_bg_sm.png'),
  white_arrow_icon: require('../../assets/white_arrow_icon.png'),
  black_arrow_icon: require('../../assets/black_arrow_icon.png'),
};

const MainBanner = () => {
  const navigation = useNavigation();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 768;

  return (
    <View style={styles.container}>
      {/* Background Image */}
      <Image
        source={isSmallScreen ? assets.main_banner_bg_sm : assets.main_banner_bg}
        style={styles.bannerImage}
        resizeMode="cover"
      />

      {/* Overlay content */}
      <View style={styles.overlay}>
        <Text style={styles.title}>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, nostrum.
        </Text>

        <View style={styles.buttonRow}>
          {/* Shop Now Button */}
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => navigation.navigate('Products' as never)}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Shop Now</Text>
            <WhiteArrowIcon width={18} height={18} />
          </TouchableOpacity>

          {/* Explore Deals Button */}
          {!isSmallScreen && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => navigation.navigate('Products' as never)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryText}>Explore Deals</Text>
              <BlackArrowIcon width={18} height={18} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default MainBanner;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: 300,
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    color: '#000',
    fontWeight: '600',
    maxWidth: 320,
    lineHeight: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#007BFF', // adjust to match your theme
  },
  secondaryButton: {
    backgroundColor: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    marginRight: 8,
  },
  secondaryText: {
    color: '#000',
    fontWeight: '500',
    marginRight: 8,
  },
  icon: {
    width: 16,
    height: 16,
  },
});
