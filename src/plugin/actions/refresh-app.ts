import { action, KeyDownEvent, SingletonAction } from '@elgato/streamdeck';

export type ActionSettings = {
  appToken: string;
};

/**
 * Forcibly refreshes a control app
 */
@action({ UUID: 'com.technative.singular.refresh' })
export class RefreshApp extends SingletonAction {
  async onKeyDown(event: KeyDownEvent<ActionSettings>): Promise<void> {
    console.log(event.payload.settings);
    const token = (await event.action.getSettings<ActionSettings>()).appToken;

    if (!token) {
      await event.action.showAlert();
      // await event.action.setImage('imgs/actions/refresh/warning');
      return;
    }

    const response = await sendRefreshCommand(token);
    if (!response.ok) {
      await event.action.showAlert();
      // await event.action.setImage('imgs/actions/refresh/warning');
      return;
    }

    await event.action.showOk();
    // await event.action.setImage('imgs/actions/refresh/key');
  }
}

function sendRefreshCommand(token: string) {
  const options = {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({ action: 'RefreshComposition' }),
  };
  const url = `https://app.overlays.uno/apiv2/controlapps/${token}/command`;
  return fetch(url, options);
}
