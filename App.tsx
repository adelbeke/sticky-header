import { StatusBar } from "expo-status-bar";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  useSharedValue,
  Extrapolation,
  useDerivedValue,
} from "react-native-reanimated";
import {
  initialWindowMetrics,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const WINDOW_HEIGHT =
  Platform.OS === "android" && Platform.Version >= 29
    ? Dimensions.get("window").height + (RNStatusBar.currentHeight ?? 0)
    : Dimensions.get("window").height;

const EXPANDED_HEIGHT_RATIO = 1 / 3;

const BASE_HEIGHT = WINDOW_HEIGHT * EXPANDED_HEIGHT_RATIO;

function App() {
  const { top } = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const baseHeight = useSharedValue(BASE_HEIGHT - top);
  const finalHeight = useDerivedValue(() => {
    return 48 + 32 + top;
  });
  const differenceBetweenHeights = useDerivedValue(() => {
    return baseHeight.value - finalHeight.value;
  });
  const searchBarLayout = useSharedValue({ height: 0, width: 0, x: 0, y: 0 });
  const greetingLayout = useSharedValue({ height: 0, width: 0, x: 0, y: 0 });

  const stickyRedViewStyleWhileScrollingTop = useAnimatedStyle(() => {
    return {
      height: baseHeight.value,
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, differenceBetweenHeights.value],
            [0, -differenceBetweenHeights.value],
            Extrapolation.CLAMP
          ),
        },
      ],
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
      overflow: "hidden",
      paddingBottom: 16,
      paddingTop: top,
    };
  });

  const searchBarStyle = useAnimatedStyle(() => {
    const finalYToReach = greetingLayout.value.y;
    const distanceToMove =
      finalYToReach -
      searchBarLayout.value.y +
      searchBarLayout.value.height +
      16 +
      8;

    return {
      transform: [
        {
          translateY: interpolate(
            scrollY.value,
            [0, differenceBetweenHeights.value],
            [0, distanceToMove],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const greetingStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [0, differenceBetweenHeights.value],
        [1, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          stickyRedViewStyleWhileScrollingTop,
          {
            backgroundColor: "red",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
          },
        ]}
      >
        <Animated.View
          onLayout={(event) => {
            if (greetingLayout.value.height) return;
            greetingLayout.value = event.nativeEvent.layout;
          }}
          style={greetingStyle}
        >
          <Text style={styles.heading}>Bonjour</Text>
          <Text style={styles.heading}>John</Text>
        </Animated.View>
        <Animated.View
          onLayout={(event) => {
            if (searchBarLayout.value.height) return;
            searchBarLayout.value = event.nativeEvent.layout;
          }}
          style={[
            searchBarStyle,
            {
              height: 48,
              width: 200,
              borderRadius: 12,
              backgroundColor: "white",
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
          <Text>Search</Text>
        </Animated.View>
      </Animated.View>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: BASE_HEIGHT - top }}
      >
        <Animated.View
          style={{ width: "100%", height: 300, backgroundColor: "blue" }}
        >
          <Text>Hello</Text>
        </Animated.View>
        <Animated.View style={{ height: 300, backgroundColor: "green" }} />
        <Animated.View style={{ height: 300, backgroundColor: "yellow" }} />
        <Animated.View style={{ height: 300, backgroundColor: "purple" }} />
        <Animated.View style={{ height: 300, backgroundColor: "orange" }} />
        <Animated.View style={{ height: 300, backgroundColor: "pink" }} />
      </Animated.ScrollView>
    </View>
  );
}

export default () => {
  return (
    <SafeAreaProvider style={{ flex: 1 }} initialMetrics={initialWindowMetrics}>
      <App />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  heading: {
    fontSize: 24,
    fontWeight: "900",
    color: "#fff",
    textAlign: "center",
  },
});
