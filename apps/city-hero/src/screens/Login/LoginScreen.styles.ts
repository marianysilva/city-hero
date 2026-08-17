import { StyleSheet } from "react-native";

/**
 * Layout mirrors the prototype (design/src/screens/01a-login.js): back
 * button top-left, centered header block, form below, "Criar agora" link
 * at the bottom of the scroll content. The link is deliberately in normal
 * flow (not absolutely pinned) — the task's own Keyboard behavior AC
 * accepts it being hidden behind the keyboard while the form is focused.
 */
export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  backButton: {
    marginTop: 8,
    marginLeft: 24,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 28,
    paddingTop: 16,
  },
  formWrap: {
    marginTop: 28,
  },
  bottomLink: {
    marginTop: 24,
  },
});
