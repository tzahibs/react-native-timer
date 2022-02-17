import moment, { Moment } from 'moment';

interface TimerService {
    time?:Moment | undefined;
    total?:number | undefined;
    timeOut?: NodeJS.Timeout;
    callback?: () => void;
    duration?: number;
    isPause?:boolean;
}

const timers: Map<string, TimerService> = new Map();


const setTimer = (name:string, callback:()=>void, duration: number) => {
  return {
    start: () => start(name, callback, duration),
    pause: () => pause(name),
    stop: () => stop(name),
  };
};


const start = async(name:string, callback:()=>void, duration: number) => {
  const currentTimer = timers.get(name);

  if (!currentTimer){
    timers.set(name, {
      time: moment(),
      callback,
      duration,
      isPause: false,
      timeOut: setCallback(name, callback, duration),
    });
  } else {
    const { isPause, timeOut, total = 0, duration = 0, callback } = currentTimer;
    if (isPause){
      currentTimer.isPause = false;
      currentTimer.time = moment();
      timeOut && clearTimeout(timeOut);
      currentTimer.timeOut = setCallback(name, callback, duration - total);
    }
  }
};

const setCallback = (name:string, callback?:()=>void, duration?:number) => duration ? setTimeout(async() => {
  await stop(name);
  callback?.();
}, duration) : undefined;


const pause = async(name:string):Promise<number> => {
  const currentTimer = timers?.get(name);
  if (!currentTimer) return 0;
  const { time = 0, total = 0, timeOut } = currentTimer;
  currentTimer.total = total + moment().diff(time);
  timeOut && clearTimeout(timeOut);
  currentTimer.isPause = true;

  return currentTimer?.total;
};

const stop = async (name:string):Promise<number> => {
  const totalTime = await pause(name);
  timers.delete(name);

  return totalTime;
};


export default {
  start,
  stop,
  pause,
  setTimer,
};
