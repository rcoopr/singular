import streamDeck from '@elgato/streamdeck';

import { RefreshApp } from './actions/refresh-app';

// Register the action.
streamDeck.actions.registerAction(new RefreshApp());

// Connect to the Stream Deck.
streamDeck.connect();
