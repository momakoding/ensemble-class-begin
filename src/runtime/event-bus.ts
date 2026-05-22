import { GameEventBus } from "@/engine";

let globalEventBus: GameEventBus | null = null;

export const useEventBus = () => (globalEventBus ??= GameEventBus.createEventBus());
