import streamDeck from '@elgato/streamdeck';

let appToken = '';
const emptyImage = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';

streamDeck.onDidConnect(async () => {
  const appTokenInput = document.querySelector('#app-token') as HTMLInputElement | undefined;

  if (appTokenInput) {
    const settings = await streamDeck.settings.getSettings<{ appToken: string }>();
    appToken = settings.appToken || '';
    appTokenInput.value = appToken;
    getAppJson(appTokenInput);

    appTokenInput.addEventListener('keydown', handleKeydown);
    appTokenInput.addEventListener('blur', handleBlur);
  }
});

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' || event.key === 'Tab') {
    getAppJson(event.currentTarget as HTMLInputElement);
  }
}

function handleBlur(event: FocusEvent) {
  getAppJson(event.currentTarget as HTMLInputElement);
}

async function getAppJson(input: HTMLInputElement | undefined) {
  if (!input) return;

  const token = input.value;

  if (appToken !== token) {
    appToken = token;
    input.dataset.state = 'loading';
    const { data, error } = await validateApp(token);

    if (error) {
      console.error(error.message);
      input.dataset.state = 'error';
    } else {
      input.dataset.state = 'ok';

      const elImage = document.querySelector('#app-token-info-box-image') as
        | HTMLImageElement
        | undefined;
      const elName = document.querySelector('#app-token-info-box-name') as
        | HTMLDivElement
        | undefined;

      if (elImage) {
        elImage.src = data.thumbnail || emptyImage;
        elImage.style.display = data.thumbnail ? 'block' : 'none';
      }
      if (elName) elName.innerText = data.name;
    }
    streamDeck.settings.setSettings({ appToken: appToken });
  }
}

async function validateApp(token: string): Promise<
  | {
      data: {
        name: string;
        thumbnail: string | null;
      };
      error: undefined;
    }
  | {
      data: undefined;
      error: {
        message: string;
      };
    }
> {
  const url = `https://app.overlays.uno/apiv2/controlapps/${token}`;
  const response = await fetch(url, {
    method: 'GET',
    redirect: 'follow',
  });

  if (!response.ok) {
    return {
      data: undefined,
      error: {
        message: 'Token is invalid',
      },
    };
  }

  try {
    const json = await response.json();

    const thumbnail: string | null =
      json.thumbnail && json.thumbnail.startsWith('//')
        ? `https:${json.thumbnail}`
        : json.thumbnail;
    return {
      data: {
        name: json.name,
        thumbnail: thumbnail,
      },
      error: undefined,
    };
  } catch (error) {
    return {
      data: undefined,
      error: {
        message: 'Unable to parse response',
      },
    };
  }
}
