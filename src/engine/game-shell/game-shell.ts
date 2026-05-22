import * as Phaser from "phaser";
import { SHELL_DEFAULTS } from "./defaults";

/**
 * GameShell —— Phaser.Game 生命周期的薄封装。
 *
 * 设计原则：
 *   - 不读取任何"游戏内容"常量（场景 key / 事件 key / 画幅等业务数值）。
 *   - 画幅用 SHELL_DEFAULTS 的兜底值；游戏要改就在场景里 scale.resize()。
 *   - 签名保持 `createGameShell(container, initialScene)`，拒绝 config 对象。
 */
export class GameShell {
  private phaserGameInstance: Phaser.Game | null = null;

  private constructor() {}

  /**
   * 传入的 initialScene 作为 Phaser.Game 的初始场景，boot 完成后自动启动。
   * 后续场景按需通过 `addScene()` / `addScenes()` 动态添加。
   */
  public static createGameShell(
    container: HTMLElement,
    initialScene: typeof Phaser.Scene
  ) {
    const newShell = new GameShell();

    newShell.phaserGameInstance = new Phaser.Game({
      type: Phaser.AUTO,
      width: SHELL_DEFAULTS.width,
      height: SHELL_DEFAULTS.height,
      parent: container,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [initialScene],
      input: {
        keyboard: true,
      },
    });

    return newShell;
  }

  addScene(sceneClass: typeof Phaser.Scene, autoStart = false): string {
    // key 传 ""，Phaser 内部会优先使用 scene config 里 super({ key }) 定义的 key
    const scene = this.phaserGameInstance?.scene.add("", sceneClass, autoStart);
    return scene?.sys.settings.key ?? "";
  }

  addScenes(sceneClasses: (typeof Phaser.Scene)[], autoStartKey?: string): string[] {
    const keys = sceneClasses.map(
      (sceneClass) =>
        this.phaserGameInstance?.scene.add("", sceneClass, false)?.sys.settings
          .key ?? ""
    );

    if (autoStartKey && keys.includes(autoStartKey)) {
      this.phaserGameInstance?.scene.start(autoStartKey);
    }

    return keys;
  }

  switchToScene(sceneKey: string, data?: object) {
    this.phaserGameInstance?.scene.start(sceneKey, data);
  }

  pause(sceneKey?: string) {
    if (!this.phaserGameInstance) return;

    if (sceneKey) {
      this.phaserGameInstance.scene.pause(sceneKey);
      return;
    }

    this.phaserGameInstance.scene.getScenes(true).forEach((scene) => {
      scene.scene.pause();
    });
  }

  resume(sceneKey?: string) {
    if (!this.phaserGameInstance) return;

    if (sceneKey) {
      this.phaserGameInstance.scene.resume(sceneKey);
      return;
    }

    this.phaserGameInstance.scene.getScenes(false).forEach((scene) => {
      scene.scene.resume();
    });
  }

  restart(sceneKey: string, data?: object) {
    this.phaserGameInstance?.scene.stop(sceneKey);
    this.phaserGameInstance?.scene.start(sceneKey, data);
  }

  destroy(removeCanvas: boolean) {
    this.phaserGameInstance?.destroy(removeCanvas);
    this.phaserGameInstance = null;
  }
}
