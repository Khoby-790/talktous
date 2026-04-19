import Pusher from "pusher-js";
import config from "~/config";

let pusherInstance: Pusher | null = null;

export const getPusher = (): Pusher => {
  if (!pusherInstance) {
    pusherInstance = new Pusher(config.pusherKey, {
      cluster: config.pusherCluster,
    });
  }
  return pusherInstance;
};
