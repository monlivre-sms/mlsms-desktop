// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels = 'ipc-example';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  app: {
    callFS: (fn, ...args) => {
      console.log('IPC::: Web: call fs function', fn);
      ipcRenderer.send('app:fs:call', fn, ...args);
      },
    callPATH: (fn, ...args) => {
      ipcRenderer.send('app:path:call', fn, ...args);
    },
    callOS: (fn, ...args) => {
      ipcRenderer.send('app:os:call', fn, ...args);
    },
    callELECTRONIS: (fn, ...args) => {
      ipcRenderer.send('app:electron-is:call', fn, ...args);
    },
    callNCP: (...args) => {
      ipcRenderer.send('app:ncp', ...args);
    }
  },
  env: process.env
};

// contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
