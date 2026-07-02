import { render, screen } from '@testing-library/react-native';

import { MonoText } from '../components/StyledText';

test('renders the given text', async () => {
  // RNTL v14 targets React 19's async rendering model, so render() must be awaited
  // before the screen object is populated — see the v14 migration guide.
  await render(<MonoText>Hello CityHero</MonoText>);
  expect(screen.getByText('Hello CityHero')).toBeTruthy();
});
