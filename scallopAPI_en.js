/**
 * 摄像机相关的API
 */
const readFile_ModifiedCameraSystem = `
export class ModifiedCameraSystem {

    private static followEnable;
    private static followRotationValue;
    private static isBind = false;
    public static followTargetEnable = true;
    public static followTargetInterpSpeed = 15;

    static get cameraLocationMode(): CameraPositionMode {
        if (!SystemUtil.isClient()) {
            return;
        }
        return Camera.currentCamera.positionMode;
    }

    static set cameraLocationMode(newCameraLocationMode: CameraPositionMode) {
        if (!SystemUtil.isClient()) {
            return;
        }
        let tempTransform = Camera.currentCamera.springArm.localTransform;
        Camera.currentCamera.positionMode = newCameraLocationMode;
        if (newCameraLocationMode == CameraPositionMode.PositionFollow) {
            Camera.currentCamera.parent = Player.localPlayer.character;
            Camera.currentCamera.springArm.localTransform = tempTransform;
        }
    }

    public static setCameraFollowTarget(target: GameObject): void {
        if (!SystemUtil.isClient()) return;
        Camera.currentCamera.parent = target;
        Camera.currentCamera.springArm.localTransform = Transform.identity;
    }

    public static cancelCameraFollowTarget(): void {
        if (!SystemUtil.isClient()) return;
        Camera.currentCamera.parent = Player.localPlayer.character;
        Camera.currentCamera.springArm.localTransform = Transform.identity;
    }

    public static setOverrideCameraRotation(newOverrideRotation: Rotation): void {
        if (!SystemUtil.isClient()) return;
        ModifiedCameraSystem.followEnable = true;
        ModifiedCameraSystem.followRotationValue = newOverrideRotation;
        Player.setControllerRotation(ModifiedCameraSystem.followRotationValue);
        if (!ModifiedCameraSystem.isBind) {
            TimeUtil.onEnterFrame.add(() => {
                if (ModifiedCameraSystem.followEnable) {
                    Player.setControllerRotation(ModifiedCameraSystem.followRotationValue);
                }
            }, this);
            ModifiedCameraSystem.isBind = true;
        }
    }

    public static resetOverrideCameraRotation(): void {
        if (!SystemUtil.isClient()) return;
        ModifiedCameraSystem.followEnable = false;
    }

    public static getCurrentSettings(): CameraSystemData {
        if (!SystemUtil.isClient()) return;
        cameraSystemConfig.cameraRelativeTransform = Camera.currentCamera.localTransform;
        cameraSystemConfig.cameraWorldTransform = Camera.currentCamera.worldTransform;
        cameraSystemConfig.targetArmLength = Camera.currentCamera.springArm.length;
        cameraSystemConfig.enableCameraLocationLag = Camera.currentCamera.positionLagEnabled;
        cameraSystemConfig.cameraLocationLagSpeed = Camera.currentCamera.positionLagSpeed;
        cameraSystemConfig.enableCameraRotationLag = Camera.currentCamera.rotationLagEnabled;
        cameraSystemConfig.cameraRotationLagSpeed = Camera.currentCamera.rotationLagSpeed;
        cameraSystemConfig.cameraFOV = Camera.currentCamera.fov;
        cameraSystemConfig.cameraLocationMode = Camera.currentCamera.positionMode;
        cameraSystemConfig.cameraRotationMode = Camera.currentCamera.rotationMode;
        cameraSystemConfig.enableCameraCollision = Camera.currentCamera.springArm.collisionEnabled;
        cameraSystemConfig.cameraUpLimitAngle = Camera.currentCamera.upAngleLimit;
        cameraSystemConfig.cameraDownLimitAngle = Camera.currentCamera.downAngleLimit;
        return cameraSystemConfig;
    }

    public static applySettings(CameraSetting: CameraSystemData): void {
        if (!SystemUtil.isClient()) return;
        Camera.currentCamera.localTransform = CameraSetting.cameraRelativeTransform;
        Camera.currentCamera.springArm.length = CameraSetting.targetArmLength;
        Camera.currentCamera.positionLagEnabled = CameraSetting.enableCameraLocationLag;
        Camera.currentCamera.positionLagSpeed = CameraSetting.cameraLocationLagSpeed;
        Camera.currentCamera.rotationLagEnabled = CameraSetting.enableCameraRotationLag;
        Camera.currentCamera.rotationLagSpeed = CameraSetting.cameraRotationLagSpeed;
        Camera.currentCamera.fov = CameraSetting.cameraFOV;
        ModifiedCameraSystem.cameraLocationMode = CameraSetting.cameraLocationMode;
        Camera.currentCamera.rotationMode = CameraSetting.cameraRotationMode;
        Camera.currentCamera.springArm.collisionEnabled = CameraSetting.enableCameraCollision;
        Camera.currentCamera.upAngleLimit = CameraSetting.cameraUpLimitAngle;
        Camera.currentCamera.downAngleLimit = CameraSetting.cameraDownLimitAngle;
    }

    public static cameraFocusing(targetArmLength: number, targetOffset: Vector, timeInterval = 20): void {
        if (!SystemUtil.isClient()) return;
        let timer = TimeUtil.onEnterFrame.add(() => {
            let interpolationValue = Camera.currentCamera.springArm.length + (targetArmLength - Camera.currentCamera.springArm.length) / timeInterval;
            Camera.currentCamera.springArm.length = interpolationValue;
            if (Math.abs(Camera.currentCamera.springArm.length - targetArmLength) <= 0.5) {
                TimeUtil.onEnterFrame.remove(timer);
            }
        })

    }

    public static startCameraShake(shakeData: CameraModifid.CameraShakeData): void {
        if (!SystemUtil.isClient()) return;
        let info: mw.CameraShakeInfo = {
            rotationYAmplitude: shakeData.rotYawOscillation.amplitude,
            rotationYFrequency: shakeData.rotYawOscillation.frequency,

            rotationZAmplitude: shakeData.rotRollOscillation.amplitude,
            rotationZFrequency: shakeData.rotRollOscillation.frequency,

            rotationXAmplitude: shakeData.rotPitchOscillation.amplitude,
            rotationXFrequency: shakeData.rotPitchOscillation.frequency,

            positionXAmplitude: shakeData.locXOscillation.amplitude,
            positionXFrequency: shakeData.locXOscillation.frequency,

            positionYAmplitude: shakeData.locYOscillation.amplitude,
            positionYFrequency: shakeData.locYOscillation.frequency,

            positionZAmplitude: shakeData.locZOscillation.amplitude,
            positionZFrequency: shakeData.locZOscillation.frequency,
        }
        Camera.shake(info);
    }

    public static stopCameraShake(): void {
        if (!SystemUtil.isClient()) return;
        Camera.stopShake();
    }

    public static getDefaultCameraShakeData(): CameraModifid.CameraShakeData {
        const defaultOscillator: CameraModifid.Oscillator = {
            amplitude: 0,
            frequency: 0,
            waveform: CameraModifid.EOscillatorWaveform.SineWave,
        };
        const defaultCameraShakeData: CameraModifid.CameraShakeData = {
            rotPitchOscillation: { ...defaultOscillator },
            rotYawOscillation: { ...defaultOscillator },
            rotRollOscillation: { ...defaultOscillator },
            locXOscillation: { ...defaultOscillator },
            locYOscillation: { ...defaultOscillator },
            locZOscillation: { ...defaultOscillator },
            fovOscillation: { ...defaultOscillator },
        };
        return defaultCameraShakeData;
    }
}

export namespace CameraModifid {

    export type CameraShakeData = {
        rotPitchOscillation?: Oscillator;
        rotYawOscillation?: Oscillator;
        rotRollOscillation?: Oscillator;
        locXOscillation?: Oscillator;
        locYOscillation?: Oscillator;
        locZOscillation?: Oscillator;
        fovOscillation?: Oscillator;
    };

    export type Oscillator = {
        amplitude?: number;
        frequency?: number;
        waveform?: EOscillatorWaveform;
    };

    export enum EOscillatorWaveform {
        /** 正弦波 */
        SineWave = 0,
        /** Perlin噪声 */
        PerlinNoise = 1
    }
}

type CameraSystemData = {

    cameraRelativeTransform?: Transform,

    cameraWorldTransform?: Transform,

    cameraProjectionMode?: CameraProjectionMode,

    targetArmLength?: number,

    enableCameraLocationLag?: boolean,

    cameraLocationLagSpeed?: number,

    enableCameraRotationLag?: boolean,

    cameraRotationLagSpeed?: number,

    cameraFOV?: number,

    cameraLocationMode?: CameraPositionMode,

    cameraRotationMode?: CameraRotationMode,

    enableCameraCollision?: boolean,

    cameraUpLimitAngle?: number,

    cameraDownLimitAngle?: number,

}

const cameraSystemConfig: CameraSystemData = {
    cameraRelativeTransform: Transform.identity,
    cameraWorldTransform: Transform.identity,
    targetArmLength: 400,
    enableCameraLocationLag: false,
    cameraLocationLagSpeed: 10,
    enableCameraRotationLag: false,
    cameraRotationLagSpeed: 10,
    cameraFOV: 90,
    cameraLocationMode: CameraPositionMode.PositionFollow,
    cameraRotationMode: CameraRotationMode.RotationControl,
    enableCameraCollision: true,
    cameraUpLimitAngle: 40,
    cameraDownLimitAngle: -40,
};
`;

/**
 * player相关的API
 */
const readFile_ModifiedPlayer = `
export class PlayerManagerExtesion {

    public static init(): void {
        ModuleService.registerModule(RpcExtesionS, RpcExtesionC, null);
    }

    public static isNpc(obj: any): obj is Character {
        if ((obj instanceof Character) && obj.player == null) {
            return true;
        }
        return false;
    }

    public static isCharacter(obj: any): obj is Character {
        if ((obj instanceof Character) && obj.player != null) {
            return true;
        }
        return false;
    }

    private static isUseRpc(isSync: boolean): boolean {
        if (SystemUtil.isServer()) {
            return false;
        } else {
            return isSync;
        }
    }

    public static stopStanceExtesion(char: mw.Character, sync?: boolean): void {
        sync = sync === undefined ? true : sync;
        if (!this.isUseRpc(sync)) {
            char.currentSubStance?.stop();
            return;
        }
        let mtStance = new RpcStance("", char);
        let module = ModuleService.getModule(RpcExtesionC);
        module.stopStanceSync(char.gameObjectId, mtStance);
    }

    public static changeBaseStanceExtesion(char: mw.Character, assetId: string): void {
        if (!this.isUseRpc(true)) {
            if (assetId == "") {
                char.currentStance?.stop();
                return;
            }
            let basicStance = char.loadStance(assetId);
            basicStance.play();
        } else {
            let module = ModuleService.getModule(RpcExtesionC);
            module.playBasicStance(char.gameObjectId, assetId);
        }
    }

    public static changeStanceExtesion(char: mw.Character, assetId: string): void {
        let sync = true;
        if (!this.isUseRpc(sync)) {
            if (assetId == "") {
                char.currentSubStance?.stop();
                return;
            }
            char.loadSubStance(assetId).play();
            return;
        }
        let mtStance = new RpcStance(assetId, char);
        let module = ModuleService.getModule(RpcExtesionC);
        module.playStanceSync(char.gameObjectId, mtStance);
    }

    public static loadStanceExtesion(char: mw.Character, assetId: string, sync?: boolean): mw.SubStance {
        sync = sync === undefined ? true : sync;
        if (!this.isUseRpc(sync)) {
            return char.loadSubStance(assetId);
        }
        sync = sync == undefined ? true : sync;
        const stance = new RpcStance(assetId, char);
        return stance;
    }

    public static rpcPlayAnimation(owner: mw.Character, assetId: string, loop: number = 1, speed: number = 1): mw.Animation {
        let ani = this.loadAnimationExtesion(owner, assetId) as RpcAnimation;
        ani.loop = loop;
        ani.speed = speed;
        ani.play();
        return ani;
    }

    public static rpcStopAnimation(owner: mw.Character, assetId: string): void {
        if (!this.isUseRpc(true)) {
            if (owner.currentAnimation && owner.currentAnimation.assetId == assetId) owner.currentAnimation.stop();
            return;
        }
        if (owner.currentAnimation && owner.currentAnimation.assetId == assetId) owner.currentAnimation.stop();
        let module = ModuleService.getModule(RpcExtesionC);
        module.stopAnimationSync(owner.gameObjectId, assetId);
    }

    public static rpcPlayAnimationLocally(owner: mw.Character, assetId: string, AnimationLength: number = 0, loopCount: number = 1) {
        if (owner === undefined || owner === null) return;
        let anim = owner.loadAnimation(assetId);
        anim.loop = loopCount;
        anim.speed = AnimationLength === 0 ? 1 : this.getRate(anim.length / AnimationLength);
        anim.play();
        return anim;
    }

    private static getRate(num: number): number {
        return Math.round(num * 100) / 100;
    }

    public static loadAnimationExtesion(char: mw.Character, assetid: string, sync?: boolean) {
        sync = sync === undefined ? true : sync;
        if (!this.isUseRpc(sync)) {
            return char.loadAnimation(assetid);
        }
        const anim = new RpcAnimation(char, assetid);
        return anim;
    }

}

class RpcExtesionC extends ModuleC<RpcExtesionS, null>{

    private syncAnimation: RpcAnimation = null;

    public net_playerJoin(playerId: number): void {
        if (this.localPlayerId == playerId) return;
        let char = this.localPlayer.character;
        let curAnimation = char.currentAnimation;
        if (!curAnimation) return;
        let ani = this.syncAnimation;
        if (ani && curAnimation.assetId == ani.assetId && ani.isPlaying) {
            this.server.net_playAnimationSync(char.gameObjectId, ani.assetId, ani.speed, ani.loop, ani.slot, playerId);
        }
    }

    public playAnimationSync(charGuid: string, myAnimation: RpcAnimation) {
        if (charGuid == this.localPlayer.character.gameObjectId) {
            this.syncAnimation = myAnimation;
        }
        this.server.net_playAnimationSync(charGuid, myAnimation.assetId, myAnimation.speed, myAnimation.loop, myAnimation.slot);
    }

    public pauseAnimationSync(charGuid: string, myAnimation: RpcAnimation) {
        this.server.net_pauseAnimationSync(charGuid, myAnimation.assetId);
    }

    public resumeAnimationSync(charGuid: string, myAnimation: RpcAnimation) {
        this.server.net_resumeAnimationSync(charGuid, myAnimation.assetId);
    }

    public stopAnimationSync(charGuid: string, myAnimation: RpcAnimation | string) {
        if (charGuid == this.localPlayer.character.gameObjectId) {
            this.syncAnimation = null;
        }
        let assetId = typeof myAnimation == "string" ? myAnimation : myAnimation.assetId;
        this.server.net_stopAnimationSync(charGuid, assetId);
    }

    public playBasicStance(charGuid: string, basicStance: string) {
        this.server.net_playBasicStance(charGuid, basicStance);
    }

    public playStanceSync(charGuid: string, myStance: RpcStance) {
        this.server.net_playStanceSync(charGuid, myStance.assetId, myStance.blendMode);
    }

    public stopStanceSync(charGuid: string, stance: RpcStance) {
        this.server.net_stopStanceSync(charGuid, stance.assetId);
    }

    public net_playAnimation(charGuid: string, assetId: string, rate: number, loop: number, slot: mw.AnimSlot) {
        if (charGuid == this.localPlayer.character.gameObjectId) return;
        RpcAnimation.playAnimation(charGuid, assetId, rate, loop, slot);
    }

    public net_pauseAnimation(charGuid: string, assetId: string) {
        if (charGuid == this.localPlayer.character.gameObjectId) return;
        RpcAnimation.pauseAnimation(charGuid, assetId);
    }

    public net_resumeAnimation(charGuid: string, assetId: string) {
        if (charGuid == this.localPlayer.character.gameObjectId) return;
        RpcAnimation.resumeAnimation(charGuid, assetId);
    }

    public net_stopAnimation(charGuid: string, assetId: string) {
        if (charGuid == this.localPlayer.character.gameObjectId) return;
        RpcAnimation.stopAnimation(charGuid, assetId);
    }

}

class RpcExtesionS extends ModuleS<RpcExtesionC, null>{

    public async net_playBasicStance(charGuid: string, basicStance: string) {
        let char = await GameObject.asyncFindGameObjectById(charGuid) as mw.Character;
        char.loadStance(basicStance).play();
    }

    public net_playAnimationSync(charGuid: string, assetId: string, rate: number, loop: number, slot: mw.AnimSlot, playerId: number = 0) {
        if (playerId != 0) {
            this.getClient(playerId).net_playAnimation(charGuid, assetId, rate, loop, slot);
            return;
        }
        this.getAllClient().net_playAnimation(charGuid, assetId, rate, loop, slot);
    }

    public net_pauseAnimationSync(charGuid: string, assetId: string) {
        this.getAllClient().net_pauseAnimation(charGuid, assetId);
    }

    public net_resumeAnimationSync(charGuid: string, assetId: string) {
        this.getAllClient().net_resumeAnimation(charGuid, assetId);
    }

    public net_stopAnimationSync(charGuid: string, assetId: string) {
        this.getAllClient().net_stopAnimation(charGuid, assetId);
    }

    public playStanceSync(charGuid: string, mystance: RpcStance) {
        RpcStance.playStance(charGuid, mystance.assetId, mystance.blendMode)
    }

    public net_stopStanceSync(charGuid: string, assetId: string) {
        RpcStance.stopStance(charGuid, assetId);
    }

    public stopStanceSync(charGuid: string, stance: RpcStance) {
        RpcStance.stopStance(charGuid, stance.assetId);
    }

    public net_playStanceSync(charGuid: string, assetid: string, blendMode: mw.StanceBlendMode) {
        RpcStance.playStance(charGuid, assetid, blendMode);
    }

    protected onPlayerEnterGame(player: mw.Player): void {
        this.getAllClient().net_playerJoin(player.playerId);
    }

}

class RpcAnimation {

    private ani: mw.Animation = null;
    public assetId: string = null;
    private owner: Character = null;
    private _loop: number = 1;
    private _speed: number = 1;
    private _slot: mw.AnimSlot = mw.AnimSlot.Default;

    constructor(char: Character, assetId: string) {
        this.owner = char;
        this.assetId = assetId;
        this.ani = char.loadAnimation(assetId);
    }

    public get loop(): number {
        return this._loop;
    }

    public set loop(value: number) {
        this._loop = value;
        this.ani.loop = value;
    }

    public get speed(): number {
        return this._speed;
    }

    public set speed(value: number) {
        this._speed = value;
        this.ani.speed = value;
    }

    public get slot(): mw.AnimSlot {
        return this._slot;
    }

    public set slot(value: mw.AnimSlot) {
        this._slot = value;
        this.ani.slot = value;
    }

    get length(): number {
        return this.ani.length;
    }

    get isPlaying(): boolean {
        return this.ani.isPlaying;
    }

    get onFinish(): mw.MulticastDelegate<() => void> {
        return this.ani.onFinish;
    }

    public play(): boolean {
        this.ani?.play();
        let module = ModuleService.getModule(RpcExtesionC);
        module.playAnimationSync(this.owner.gameObjectId, this);
        return true;
    }

    public pause(): boolean {
        this.ani?.pause();
        let module = ModuleService.getModule(RpcExtesionC);
        module.pauseAnimationSync(this.owner.gameObjectId, this);
        return true;
    }

    public resume(): boolean {
        this.ani?.resume();
        let module = ModuleService.getModule(RpcExtesionC);
        module.resumeAnimationSync(this.owner.gameObjectId, this);
        return true;
    }

    public stop(): boolean {
        this.ani?.stop();
        let module = ModuleService.getModule(RpcExtesionC);
        module.stopAnimationSync(this.owner.gameObjectId, this);
        return true;
    }

    public static playAnimation(guid: string, assetid: string, speed: number, loop: number, slot: mw.AnimSlot): mw.Animation {
        let char = Character.findGameObjectById(guid) as Character;
        if (!char) return;
        let anim = char.loadAnimation(assetid);
        anim.loop = loop;
        anim.speed = speed;
        anim.slot = slot;
        anim.play();
        return anim;
    }

    public static pauseAnimation(guid: string, assetId: string): void {
        let char = Character.findGameObjectById(guid) as Character;
        if (!char) return;
        let anim = char.currentAnimation;
        if (!anim) return;
        anim.pause();
    }

    public static resumeAnimation(guid: string, assetId: string): void {
        let char = Character.findGameObjectById(guid) as Character;
        if (!char) return;
        let anim = char.currentAnimation;
        if (!anim) return;
        anim.resume();
    }

    public static stopAnimation(guid: string, assetId: string): void {
        let char = Character.findGameObjectById(guid) as Character;
        if (!char) return;
        let anim = char.currentAnimation;
        if (!anim) return;
        anim.stop();
    }

}

class RpcStance {

    public assetId: string = null;
    public owner: Character = null;
    public blendMode: mw.StanceBlendMode = null;

    constructor(assetId: string, owner: Character) {
        this.assetId = assetId;
        this.owner = owner;
    }

    public play(): boolean {
        let module = SystemUtil.isServer() ? ModuleService.getModule(RpcExtesionS) : ModuleService.getModule(RpcExtesionC);
        module.playStanceSync(this.owner.gameObjectId, this);
        return true;
    }

    public stop(): boolean {
        let module = SystemUtil.isServer() ? ModuleService.getModule(RpcExtesionS) : ModuleService.getModule(RpcExtesionC);
        module.stopStanceSync(this.owner.gameObjectId, this);
        return true;
    }

    public static playStance(charGuid: string, assetId: string, blendMode: mw.StanceBlendMode) {
        let char = GameObject.findGameObjectById(charGuid) as mw.Character;
        if (!char) return;
        if (assetId == "") {
            char.currentSubStance?.stop();
            return;
        }
        let stance = char.loadSubStance(assetId);
        if (blendMode != null) stance.blendMode = blendMode;
        stance.play();
    }

    public static stopStance(charGuid: string, assetId: string) {
        let char = GameObject.findGameObjectById(charGuid) as mw.Character;
        if (!char) return;
        let currentStance = char.currentSubStance;
        if (currentStance && (currentStance.assetId == assetId || assetId == "")) {
            currentStance.stop();
        }
    }

}

PlayerManagerExtesion.init();
`;

/**
 * ModifiedSpawn相关的API
 */
const readFile_ModifiedSpawn = `
export interface SpawnInfo {
    guid?: string;
    gameObjectId?: string;
    replicates?: boolean;
    transform?: mw.Transform;
}

export class SpawnManager {
    private static replicateDic: Map<string, string> = new Map([
        ["104", "Sound"],
        ["109", "SpawnLocation"],
        ["113", "Trigger"],
        ["116", "Interactor"],
        ["117", "BlockingVolume"],
        ["4301", "PointLight"],
        ["4306", "Effect"],
        ["20191", "PhysicsThruster"],
        ["20193", "NavigationVolume"],
        ["21151", "PostProcess"],
        ["108547", "ObjectLauncher"],
        ["119918", "IntegratedMover"],
        ["12683", "SwimmingVolume"],
        ["16037", "UIWidget"],
        ["16038", "WheeledVehicle4W"],
        ["20504", "PhysicsFulcrum"],
        ["20194", "NavModifierVolume"],
        ["20638", "HotWeapon"],
        ["25782", "Anchor"],
        ["67455", "PhysicsImpulse"],
        ["NPC", "Character"],
        ["31969", "Character"],
        ["124744", "Character"],
        ["28449", "Character"],

        ["BlockingArea", "BlockingVolume"],
        ["RelativeEffect", "Effect"],
        ["Thruster", "PhysicsThruster"],
        ["NavMeshVolume", "NavigationVolume"],
        ["PostProcessAdvance", "PostProcess"],
        ["ProjectileLauncher", "ObjectLauncher"],
        ["PhysicsSports", "IntegratedMover"],
    ])
    private static deleteDic: Map<string, boolean> = new Map([
        ["110", true],
        ["8444", true],
        ["14090", true],
        ["14971", true],
        ["2695", true],
        ["30829", true],
        ["31479", true],
        ["14197", true],
    ])
    private static replicateGuid(guid: string) {
        let res = guid;
        if (this.replicateDic.has(guid)) {
            res = this.replicateDic.get(guid);
        } else if (this.deleteDic.has(guid)) {
            console.error("-------", guid, "------- is deleted!");
        }
        return res;
    }

    public static modifyPoolSpawn<T extends GameObject>(guid: string, type?: GameObjPoolSourceType): T {
        let assetId = this.replicateGuid(guid);
        if (type == undefined) {
            return GameObjPool.spawn(assetId);
        }
        return GameObjPool.spawn(assetId, type);
    }

    public static modifyPoolAsyncSpawn<T extends GameObject>(guid: string, type?: GameObjPoolSourceType): Promise<T> {
        let assetId = this.replicateGuid(guid);
        if (type == undefined) {
            return GameObjPool.asyncSpawn(assetId);
        }
        return GameObjPool.asyncSpawn(assetId, type);
    }

    public static wornSpawn<T extends GameObject>(assetId: string, inReplicates?: boolean, transform?: mw.Transform): T {
        let info: SpawnInfo = {
            guid: assetId,
            replicates: inReplicates,
            transform: transform
        }
        return this.spawn(info);
    }

    public static wornAsyncSpawn<T extends GameObject>(assetId: string, inReplicates?: boolean, transform?: mw.Transform): Promise<T> {
        let info: SpawnInfo = {
            guid: assetId,
            replicates: inReplicates,
            transform: transform
        }
        return this.asyncSpawn(info);
    }

    public static spawn<T extends GameObject>(info: SpawnInfo): T {
        let assetId = info.gameObjectId ? info.gameObjectId : info.guid;
        let guid = this.replicateGuid(assetId);
        let obj = mw.GameObject.spawn<T>(guid, { replicates: info.replicates, transform: info.transform });
        return obj;
    }

    public static asyncSpawn<T extends GameObject>(info: SpawnInfo): Promise<T> {
        let assetId = info.gameObjectId ? info.gameObjectId : info.guid;
        let guid = this.replicateGuid(assetId);
        let obj = mw.GameObject.asyncSpawn<T>(guid, { replicates: info.replicates, transform: info.transform });
        return obj;
    }
}
`;

/**
 * ModifiedStaticAPI相关的API
 */
const readFile_ModifiedStaticAPI = `
export class GeneralManager {

    private vscodeChange(): void {
        let animation: Animation;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'rate' with 'speed', and then replace 'speed' with 'rate'.
        animation.speed = 1;
        let obj: GameObject;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'guid' with 'gameObjectId', and then replace 'gameObjectId' with 'guid'.
        obj.gameObjectId;
        let camera: GameObject;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'transform' with 'worldTransform', and then replace 'worldTransform' with 'transform'.
        camera.worldTransform;
        let model: mw.Model;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'onEnter' with 'onTouch', and then replace 'onTouch' with 'onEnter'.
        model.onTouch;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'onLeave' with 'onTouchEnd', and then replace 'onTouchEnd' with 'onLeave'.
        model.onTouchEnd;
        let effect: mw.Effect;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'color' with 'maskcolor', and then replace 'maskcolor' with 'color'.
        effect.maskcolor;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'onFinished' with 'onFinish', and then replace 'onFinish' with 'onFinished'.
        effect.onFinish;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'particleLength' with 'timeLength', and then replace 'timeLength' with 'particleLength'.
        effect.timeLength;
        let sound: mw.Sound;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'currentProgress' with 'timePosition', and then replace 'timePosition' with 'currentProgress'.
        sound.timePosition;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'duration' with 'timeLength', and then replace 'timeLength' with 'duration'.
        sound.timeLength;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'timelength' with 'timeLength', and then replace 'timeLength' with 'timelength'.
        sound.timeLength;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'loop' with 'isLoop', and then replace 'isLoop' with 'loop'.
        sound.isLoop;
        let transform: Transform;
        //First, use the rename symbol function in VSCode by pressing F2 to replace 'location' with 'position', and then replace 'position' with 'location'.
        transform.position;
        class module extends ModuleC<null, null>{
            //First, use the rename symbol function in VSCode by pressing F2 to replace 'currentPlayer' with 'localPlayer', and then replace 'localPlayer' with 'currentPlayer'.
            protected get localPlayer(): mw.Player {
                return null;
            }
            //First, use the rename symbol function in VSCode by pressing F2 to replace 'currentPlayerId' with 'localPlayerId', and then replace 'localPlayerId' with 'currentPlayerId'.
            protected get localPlayerId(): number {
                return null;
            }
        }

    }

    public static async asyncRpcGetData(key: string): Promise<any> {
        let value = await DataStorage.asyncGetData(key);
        return value.data;
    }

    public static async asyncRpcGetPlayer(playerId: number): Promise<mw.Player> {
        let player = Player.getPlayer(playerId);
        return Promise.resolve(player);
    }

    public static rpcPlayEffectOnPlayer(source: string, target: mw.Player | mw.Character, slotType: mw.HumanoidSlotType, loopCount?: number, offset?: mw.Vector, rotation?: mw.Rotation, scale?: mw.Vector): number {
        let duration = undefined;
        if (loopCount < 0) {
            duration = -loopCount;
            loopCount = undefined;
        }
        return EffectService.playOnGameObject(source, target instanceof mw.Player ? target.character : target, {
            slotType: slotType,
            loopCount: loopCount,
            duration: duration,
            position: offset,
            rotation: rotation,
            scale: scale
        });
    }

    public static rpcPlayEffectOnGameObject(source: string, target: mw.GameObject, loopCount?: number, offset?: mw.Vector, rotation?: mw.Rotation, scale?: mw.Vector): number {
        let duration = undefined;
        if (loopCount < 0) {
            duration = -loopCount;
            loopCount = undefined;
        }
        return EffectService.playOnGameObject(source, target, {
            loopCount: loopCount,
            duration: duration,
            position: offset,
            rotation: rotation,
            scale: scale
        });
    }

    public static rpcPlayEffectAtLocation(source: string, location: mw.Vector, loopCount?: number, rotation?: mw.Rotation, scale?: mw.Vector): number {
        let duration = undefined;
        if (loopCount < 0) {
            duration = -loopCount;
            loopCount = undefined;
        }
        return EffectService.playAtPosition(source, location, {
            loopCount: loopCount,
            duration: duration,
            rotation: rotation,
            scale: scale,
        })
    }

    public static modifyShowAd(adsType: AdsType, callback: (state: AdsState) => void): void {
        AdsService.showAd(adsType, isSuccess => {
            if (isSuccess) {
                callback(AdsState.Success);
                if (adsType == AdsType.Reward) callback(AdsState.Reward);
                callback(AdsState.Close);
            } else {
                callback(AdsState.Fail);
            }
        });
    }

    public static modiftEnterInteractiveState(inter: mw.Interactor, characterObj: mw.GameObject): Promise<boolean> {
        if (!(characterObj instanceof mw.Character)) {
            return Promise.resolve(false);
        }
        let reult = inter.enter(characterObj);
        if (!reult) return Promise.resolve(false);
        return new Promise<boolean>((resolve, reject) => {
            let resultFun = () => {
                inter.onEnter.remove(resultFun);
                resolve(true);
            }
            inter.onEnter.add(resultFun);
        });
    }

    public static modifyExitInteractiveState(inter: mw.Interactor, Location: Vector, stance?: string): Promise<boolean> {
        let result = inter.leave(Location, null, stance);
        return Promise.resolve(result);
    }

    public static modifyaddOutlineEffect(obj: mw.GameObject, OutlineColor?: mw.LinearColor, OutlineWidth?: number, OutlineDepthOffset?: number, OutlineClampValue?: number, considerCameraPosition?: boolean, outlineSilhouetteOnly?: boolean): void {
        if (obj instanceof mw.Model || obj instanceof Character) {
            obj.setOutline(true, OutlineColor, OutlineWidth);
        }
    }

    /**Remove outline effect*/
    public static modifyRemoveOutlineEffect(obj: mw.GameObject) {
        if (obj instanceof mw.Model || obj instanceof Character) {
            obj.setOutline(false);
        }
    }

    /**Rectangular range detection */
    public static modiftboxOverlap(startLocation: Vector, endLocation: Vector, width: number, height: number, drawDebug?: boolean, objectsToIgnore?: Array<string>, ignoreObjectsByType?: boolean, self?: GameObject): Array<GameObject> {
        let halfSize = new Vector(1, width / 2, height / 2);
        let orientation = Vector.subtract(endLocation, startLocation).toRotation();
        let results = QueryUtil.boxTrace(startLocation, endLocation, halfSize, orientation, true, drawDebug, objectsToIgnore, ignoreObjectsByType, self);
        let objResults = new Array<GameObject>();
        for (let i = 0; i < results.length; i++) {
            let obj = results[i].gameObject;
            if (!obj) continue;
            if (objResults.indexOf(obj) == -1) objResults.push(obj);
        }
        return objResults;
    }

    /**Deprecated rectangular range detection */
    public static modifyboxOverlapInLevel(StartLocation: Vector, EndLocation: Vector, Width: number, Height: number, debug: boolean, IgnoreObjectsGuid?: Array<string>, IgnoreByKind?: boolean, Source?: GameObject): Array<GameObject> {
        let halfSize = new Vector(1, Width / 2, Height / 2);
        let orientation = Vector.subtract(EndLocation, StartLocation).toRotation();
        let results = QueryUtil.boxTrace(StartLocation, EndLocation, halfSize, orientation, true, debug, IgnoreObjectsGuid, IgnoreByKind, Source);
        let objResults = new Array<GameObject>();
        for (let i = 0; i < results.length; i++) {
            let obj = results[i].gameObject;
            if (!obj) continue;
            if (objResults.indexOf(obj) == -1) objResults.push(obj);
        }
        return objResults;
    }

    public static modifyGetShootDir(chara: Character, startPos: Vector, shootRange: number): Vector {
        const camera = Camera.currentCamera;
        let start = Vector.zero;
        let end = Vector.zero;
        let dir = Vector.zero;
        if (startPos) {
            start = startPos;
        }
        if (camera) {
            end = camera.worldTransform.position.add(camera.worldTransform.getForwardVector().multiply(shootRange));
            const hits = QueryUtil.lineTrace(camera.worldTransform.position, end, false, true, [], false, false, chara);
            dir = end.subtract(start);
            if (hits.length > 0) {
                dir = hits[0].impactPoint.subtract(start);
            }
        }
        return dir.normalize();
    }

    public static modifyProjectWorldLocationToWidgetPosition(player: mw.Player, worldLocation: mw.Vector, outScreenPosition: mw.Vector2, isPlayerViewportRelative: boolean): boolean {
        let result = InputUtil.projectWorldPositionToWidgetPosition(worldLocation, isPlayerViewportRelative);
        outScreenPosition.x = result.screenPosition.x;
        outScreenPosition.y = result.screenPosition.y;
        return result.result;
    }

    public static setMaterialColor(model: Model, Index: number, InColor: LinearColor): void {
        let materialList = model.getMaterialInstance();
        materialList[Index].getAllVectorParameterName().forEach((v, i) => {
            materialList[Index].setVectorParameterValue(v, InColor);
        });
    }

    public static getMaterialColor(model: Model, Index: number): LinearColor {
        let materialList = model.getMaterialInstance();
        if (!(materialList.length > 0)) {
            return;
        }
        let nameList = materialList[Index].getAllVectorParameterName();
        return nameList.length > 0 ? materialList[Index].getVectorParameterValue(nameList[0]) : new LinearColor(1, 1, 1, 1);
    }

}
`

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { promisify } = require('util');

const sceneTempTxt = '027SceneBackupFolder'
const apiTempTxt = '027CodeBackupFolder'
const recordFile = '027ModificationRecord.txt'

function write_content_to_file(file_path, content) {
    if (!fs.existsSync('JavaScripts/Modified027Editor')) {
        fs.mkdirSync('JavaScripts/Modified027Editor', { recursive: true });
    }
    // 在aa目录下写入文件
    file_path = path.join('JavaScripts/Modified027Editor', file_path);
    fs.writeFileSync(file_path, content, 'utf-8');
}

// 写入文件
write_content_to_file('ModifiedPlayer.ts', readFile_ModifiedPlayer);
write_content_to_file('ModifiedCamera.ts', readFile_ModifiedCameraSystem);
write_content_to_file('ModifiedSpawn.ts', readFile_ModifiedSpawn);
write_content_to_file('ModifiedStaticAPI.ts', readFile_ModifiedStaticAPI);


var sceneFirstReplaceStr = {
    ",{\\\\\\\"apiName\\\\\\\":\\\\\\\"hairsetMesh\\\\\\\",\\\\\\\"value\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"saveFileType\\\\\\\":\\\\\\\"v1\\\\\\\"}": "",
    ",{\\\\\\\"apiName\\\\\\\":\\\\\\\"facesetMesh\\\\\\\",\\\\\\\"value\\\\\\\":\\\\\\\"\\\\\\\",\\\\\\\"saveFileType\\\\\\\":\\\\\\\"v1\\\\\\\"}": ""
};


sceneReplaceStr = {
    '"Asset":"BlockingArea"': '"Asset":"BlockingVolume"',
    '"Asset":"PostProcessAdvance"': '"Asset":"PostProcess"',
    '"Asset":"NavMeshVolume"': '"Asset":"NavigationVolume"',
    '"Asset":"RelativeEffect"': '"Asset":"Effect"',
    '"Asset":"Thruster"': '"Asset":"PhysicsThruster"',
    '"Asset":"PhysicsSports"': '"Asset":"IntegratedMover"',
    '"Asset":"ProjectileLauncher"': '"Asset":"ObjectLauncher"',
    '"Asset":"Camera"': '"Asset":"MetaWorld_JSActor"',
    '"Asset":"HumanoidObject"': '"Asset":"Character"',
    '"Asset":"104"': '"Asset":"Sound"',
    '"Asset":"109"': '"Asset":"PlayerStart"',
    '"Asset":"113"': '"Asset":"Trigger"',
    '"Asset":"116"': '"Asset":"Interactor"',
    '"Asset":"4301"': '"Asset":"PointLight"',
    '"Asset":"117"': '"Asset":"BlockingVolume"',
    '"Asset":"4306"': '"Asset":"Effect"',
    '"Asset":"20191"': '"Asset":"PhysicsThruster"',
    '"Asset":"20193"': '"Asset":"NavigationVolume"',
    '"Asset":"21151"': '"Asset":"PostProcess"',
    '"Asset":"108547"': '"Asset":"ObjectLauncher"',
    '"Asset":"119918"': '"Asset":"IntegratedMover"',
    '"Asset":"28449"': '"Asset":"Character"',
    '"Asset":"31969"': '"Asset":"Character"',
    '"Asset":"124744"': '"Asset":"Character"',
    '"Asset":"110"': '"Asset":"Character"',
    '"Asset":"8444"': '"Asset":"Character"',
    '"Asset":"14971"': '"Asset":"SkyBox"',
    '"Asset":"12683"': '"Asset":"SwimmingVolume"',
    '"Asset":"16037"': '"Asset":"UIWidget"',
    '"Asset":"16038"': '"Asset":"WheeledVehicle4W"',
    '"Asset":"20504"': '"Asset":"PhysicsFulcrum"',
    '"Asset":"20194"': '"Asset":"NavModifierVolume"',
    '"Asset":"20638"': '"Asset":"HotWeapon"',
    '"Asset":"25782"': '"Asset":"Anchor"',
    '"Asset":"67455"': '"Asset":"PhysicsImpulse"',
    '"Asset":"NPC"': '"Asset":"Character"',
    '"Asset":"HumanoidObject_V2"': '"Asset":"Character"',

    '"Asset": "HumanoidObject_V2"': '"Asset":"Character"',
    '"Asset": "NPC"': '"Asset":"Character"',
    '"Asset": "BlockingArea"': '"Asset":"BlockingVolume"',
    '"Asset": "PostProcessAdvance"': '"Asset":"PostProcess"',
    '"Asset": "NavMeshVolume"': '"Asset":"NavigationVolume"',
    '"Asset": "RelativeEffect"': '"Asset":"Effect"',
    '"Asset": "Thruster"': '"Asset":"PhysicsThruster"',
    '"Asset": "PhysicsSports"': '"Asset":"IntegratedMover"',
    '"Asset": "ProjectileLauncher"': '"Asset":"ObjectLauncher"',
    '"Asset": "Camera"': '"Asset":"MetaWorld_JSActor"',
    '"Asset": "HumanoidObject"': '"Asset":"Character"',
    '"Asset": "104"': '"Asset":"Sound"',
    '"Asset": "109"': '"Asset":"PlayerStart"',
    '"Asset": "113"': '"Asset":"Trigger"',
    '"Asset": "116"': '"Asset":"Interactor"',
    '"Asset": "4301"': '"Asset":"PointLight"',
    '"Asset": "117"': '"Asset":"BlockingVolume"',
    '"Asset": "4306"': '"Asset":"Effect"',
    '"Asset": "20191"': '"Asset":"PhysicsThruster"',
    '"Asset": "20193"': '"Asset":"NavigationVolume"',
    '"Asset": "21151"': '"Asset":"PostProcess"',
    '"Asset": "108547"': '"Asset":"ObjectLauncher"',
    '"Asset": "119918"': '"Asset":"IntegratedMover"',
    '"Asset": "28449"': '"Asset":"Character"',
    '"Asset": "31969"': '"Asset":"Character"',
    '"Asset": "124744"': '"Asset":"Character"',
    '"Asset": "110"': '"Asset":"Character"',
    '"Asset": "8444"': '"Asset":"Character"',
    '"Asset": "14971"': '"Asset":"SkyBox"',
    '"Asset": "12683"': '"Asset":"SwimmingVolume"',
    '"Asset": "16037"': '"Asset":"UIWidget"',
    '"Asset": "16038"': '"Asset":"WheeledVehicle4W"',
    '"Asset": "20504"': '"Asset":"PhysicsFulcrum"',
    '"Asset": "20194"': '"Asset":"NavModifierVolume"',
    '"Asset": "20638"': '"Asset":"HotWeapon"',
    '"Asset": "25782"': '"Asset":"Anchor"',
    '"Asset": "67455"': '"Asset":"PhysicsImpulse"',

    //资源废弃修改 end

    "BP_HumanoidObject_V2": "BP_Npc",
    '"ScriptAsset":"Camera"': '"ScriptAsset":"CameraSetting"',
    '"ScriptAsset": "Camera"': '"ScriptAsset": "CameraSetting"',
    "HumanoidObject_V2": "Character",
}

sceneRegexList = {

    "\\.addDestroyCallback\\(": ".onDestroyDelegate.add(",
    "mw\\.GameObject\\.asyncFind\\(": "GameObject.asyncFindGameObjectById(",
    "GameObject\\.asyncFind\\(": "GameObject.asyncFindGameObjectById(",
    "\\.asyncGetScriptByName\\(": ".getScriptByName(",
    "\\.attachToGameObject\\((.*?)\\)": ".parent = $1",
    "\\.deleteDestroyCallback\\(": ".onDestroyDelegate.remove(",
    "\\.detachFromGameObject\\(\\)": ".parent = null",
    "mw\\.GameObject\\.find\\(": "GameObject.findGameObjectById(",
    "GameObject.find\\(": "GameObject.findGameObjectById(",
    "GameObject\\.findGameObjectByTag\\(": "GameObject.findGameObjectsByTag(",
    "\\.forwardVector": ".worldTransform.getForwardVector()",
    "\\.getBoundingBoxSize\\(\\)": ".getBoundingBoxExtent()",
    "\\.getChildByGuid\\(": ".getChildByGameObjectId(",
    "\\.getChildrenBoxCenter\\(": ".getChildrenBoundingBoxCenter(",
    "mw\\.GameObject\\.getGameObjectByName\\(": "GameObject.findGameObjectByName(",
    "GameObject\\.getGameObjectByName\\(": "GameObject.findGameObjectByName(",
    "mw\\.GameObject\\.getGameObjectsByName\\(": "GameObject.findGameObjectsByName(",
    "GameObject\\.getGameObjectsByName\\(": "GameObject.findGameObjectsByName(",
    "\\.getRelativeLocation\\(\\)": ".localTransform.position",
    "\\.getRelativeRotation\\(\\)": ".localTransform.rotation",
    "\\.getRelativeScale\\(\\)": ".localTransform.scale",
    "\\.getScriptByGuid\\(": ".getScript(",
    "\\.getTransform\\(\\)": ".worldTransform.clone()",
    "\\.getUpVector\\(": ".worldTransform.getUpVector(",
    "\\.getWorldLocation\\(\\)": ".worldTransform.position",
    "\\.getWorldRotation\\(\\)": ".worldTransform.rotation",
    "\\.getWorldScale\\(\\)": ".worldTransform.scale",
    "\\.ready\\(": ".asyncReady(",
    "\\.relativeLocation": ".localTransform.position",
    "\\.relativeRotation": ".localTransform.rotation",
    "\\.relativeScale": ".localTransform.scale",
    "\\.rightVector": ".worldTransform.getRightVector()",
    "\\.setRelativeLocation\\(": ".localTransform.position = (",
    "\\.setRelativeRotation\\(": ".localTransform.rotation = (",
    "\\.setRelativeScale\\(": ".localTransform.scale = (",
    "\\.setTransform\\(": ".worldTransform = (",
    "\\.setWorldLocation\\(": ".worldTransform.position = (",
    "\\.setWorldRotation\\(": ".worldTransform.rotation = (",
    "\\.setWorldScale\\(": ".worldTransform.scale = (",
    "\\.upVector": ".worldTransform.getUpVector()",
    "\\.worldLocation": ".worldTransform.position",
    "\\.worldRotation": ".worldTransform.rotation",
    "\\.worldScale": ".worldTransform.scale",

    '"Asset":"HumanoidObject_V2"': '"Asset":"Character"',
    '"Asset":"NPC"': '"Asset":"Character"',
    ',"NPC",': ',"Character",',
    '"characterEditorDataJson":"{\\\\"realData\\\\":\\\\"\\[{\\\\\\\\\\\\"apiName\\\\\\\\\\\\":\\\\\\\\\\\\"changeCharacter\\\\\\\\\\\\",\\\\\\\\\\\\"value\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\",\\\\\\\\\\\\"saveFileType\\\\\\\\\\\\":\\\\\\\\\\\\"4Foot\\\\\\\\\\\\"},{\\\\\\\\\\\\"apiName\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\",\\\\\\\\\\\\"value\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\",\\\\\\\\\\\\"saveFileType\\\\\\\\\\\\":\\\\\\\\\\\\"4Foot\\\\\\\\\\\\"}\\]\\\\",\\\\"characterType\\\\":\\\\"(\\w+)\\\\",\\\\"basicStance\\\\":\\\\"(\\w+)\\\\",\\\\"version\\\\":\\\\"2.1\\\\"}"':
        '"characterEditorDataJson":"{\\"data\\":[14352639,$3],\\"littleEndian\\":1,\\"version\\":\\"2.2\\"}"',
    '"characterEditorDataJson":"{\\\\"realData\\\\":\\\\"\\[{\\\\\\\\\\\\"apiName\\\\\\\\\\\\":\\\\\\\\\\\\"changeCharacter\\\\\\\\\\\\",\\\\\\\\\\\\"value\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\",\\\\\\\\\\\\"saveFileType\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\"},{\\\\\\\\\\\\"apiName\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\",\\\\\\\\\\\\"value\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\",\\\\\\\\\\\\"saveFileType\\\\\\\\\\\\":\\\\\\\\\\\\"(\\w+)\\\\\\\\\\\\"}\\]\\\\",\\\\"characterType\\\\":\\\\"(\\w+)\\\\",\\\\"basicStance\\\\":\\\\"(\\w+)\\\\",\\\\"version\\\\":\\\\"2.1\\\\"}"':
        '"characterEditorDataJson":"{\\"data\\":[14352639,$4],\\"littleEndian\\":1,\\"basicStance\\":\\"$7\\",\\"version\\":\\"2.2\\"}"',
    '\\.behindHair\\.getColor\\(\\)': '.description.advance.hair.backHair.color.color',
};

apiRegexList = {

    //HumanoidV2BehindHairPart
    '\\.behindHair\\.getColor\\(\\)': '.description.advance.hair.backHair.color.color',
    '\\.behindHair\\.getGradientColor\\(\\)': '.description.advance.hair.backHair.color.gradientColor',
    '\\.behindHair\\.getGradientIntensity\\(\\)': '.description.advance.hair.backHair.color.gradientArea',
    '\\.behindHair\\.getHeaddressColor\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].color.accessoryColor',
    '\\.behindHair\\.getHeaddressDesignColor\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].design.designColor',
    '\\.behindHair\\.getHeaddressDesignRotation\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].design.designRotation',
    '\\.behindHair\\.getHeaddressDesignTexture\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].design.designStyle',
    '\\.behindHair\\.getHeaddressDesignZoom\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].design.designScale',
    '\\.behindHair\\.getHeaddressPatternAngle\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].pattern.patternRotation',
    '\\.behindHair\\.getHeaddressPatternColor\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].pattern.patternColor',
    '\\.behindHair\\.getHeaddressPatternHeight\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].pattern.patternVerticalScale',
    '\\.behindHair\\.getHeaddressPatternTexture\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].pattern.patternStyle',
    '\\.behindHair\\.getHeaddressPatternWidth\\((.*?)\\)': '.description.advance.hair.backHair.accessories[$1].pattern.patternHorizontalScale',
    '\\.behindHair\\.getHighlightColor\\(\\)': '.description.advance.hair.backHair.highlight.highlightStyle',
    '\\.behindHair\\.getHighlightMask\\(\\)': '.description.advance.hair.backHair.highlight.highlightStyle',
    '\\.behindHair\\.getMesh\\(\\)': '.description.advance.hair.backHair.style',
    '\\.behindHair\\.setColor\\((.*?)\\)': '.description.advance.hair.backHair.color.color = $1',
    '\\.behindHair\\.setGradientColor\\((.*?)\\)': '.description.advance.hair.backHair.color.gradientColor = $1',
    '\\.behindHair\\.setGradientIntensity\\((.*?)\\)': '.description.advance.hair.backHair.color.gradientArea = $1',
    '\\.behindHair\\.setHeaddressColor\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].color.accessoryColor = $1',
    '\\.behindHair\\.setHeaddressDesignColor\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].design.designColor = $1',
    '\\.behindHair\\.setHeaddressDesignRotation\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].design.designRotation = $1',
    '\\.behindHair\\.setHeaddressDesignTexture\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].design.designStyle = $1',
    '\\.behindHair\\.setHeaddressDesignZoom\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].design.designScale = $1',
    '\\.behindHair\\.setHeaddressPatternAngle\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].pattern.patternRotation = $1',
    '\\.behindHair\\.setHeaddressPatternColor\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].pattern.patternColor = $1',
    '\\.behindHair\\.setHeaddressPatternHeight\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].pattern.patternVerticalScale = $1',
    '\\.behindHair\\.setHeaddressPatternIntensity\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].pattern.patternVisibility = $1',
    '\\.behindHair\\.setHeaddressPatternTexture\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].pattern.patternStyle = $1',
    '\\.behindHair\\.setHeaddressPatternWidth\\((.*?)\\)': '.description.advance.hair.backHair.accessories[index].pattern.patternHorizontalScale = $1',
    '\\.behindHair\\.setHighlightColor\\((.*?)\\)': '.description.advance.hair.backHair.highlight.highlightStyle = $1',
    '\\.behindHair\\.setHighlightMask\\((.*?)\\)': '.description.advance.hair.backHair.highlight.highlightStyle = $1',
    '\\.behindHair\\.setMesh\\((.*?)\\)': '.description.advance.hair.backHair.style = $1',


    //HumanoidV2ClothPart 无替换

    //HumanoidV2FrontHairPart
    '\\.frontHair\\.getColor\\(\\)': '.description.advance.hair.frontHair.color.color',
    '\\.frontHair\\.getGradientColor\\(\\)': '.description.advance.hair.frontHair.color.gradientColor',
    '\\.frontHair\\.getGradientIntensity\\(\\)': '.description.advance.hair.frontHair.color.gradientArea',
    '\\.frontHair\\.getHeaddressColor\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].color.accessoryColor',
    '\\.frontHair\\.getHeaddressDesignColor\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].design.designStyle',
    '\\.frontHair\\.getHeaddressDesignRotation\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].design.designRotation',
    '\\.frontHair\\.getHeaddressDesignTexture\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].design.designStyle',
    '\\.frontHair\\.getHeaddressDesignZoom\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].design.designScale',
    '\\.frontHair\\.getHeaddressPatternAngle\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].pattern.patternRotation',
    '\\.frontHair\\.getHeaddressPatternColor\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].pattern.patternColor',
    '\\.frontHair\\.getHeaddressPatternHeight\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].pattern.patternVerticalScale',
    '\\.frontHair\\.getHeaddressPatternIntensity\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].pattern.patternVisibility',
    '\\.frontHair\\.getHeaddressPatternTexture\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].pattern.patternStyle',
    '\\.frontHair\\.getHeaddressPatternWidth\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[$1].pattern.patternHorizontalScale',
    '\\.frontHair\\.getHighlightMask\\(\\)': '.description.advance.hair.frontHair.highlight.highlightStyle',
    '\\.frontHair\\.getMesh\\(\\)': '.description.advance.hair.frontHair.style',
    '\\.frontHair\\.setColor\\((.*?)\\)': '.description.advance.hair.frontHair.color.color = $1',
    '\\.frontHair\\.setGradientColor\\((.*?)\\)': '.description.advance.hair.frontHair.color.gradientColor = $1',
    '\\.frontHair\\.setGradientIntensity\\((.*?)\\)': '.description.advance.hair.frontHair.color.gradientArea = $1',
    '\\.frontHair\\.setHeaddressColor\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].color.accessoryColor = $1',
    '\\.frontHair\\.setHeaddressDesignColor\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].design.designColor = $1',
    '\\.frontHair\\.setHeaddressDesignRotation\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].design.designRotation = $1',
    '\\.frontHair\\.setHeaddressDesignTexture\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].design.designStyle = $1',
    '\\.frontHair\\.setHeaddressDesignZoom\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].design.designScale = $1',
    '\\.frontHair\\.setHeaddressPatternAngle\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].pattern.patternRotation = $1',
    '\\.frontHair\\.setHeaddressPatternColor\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].pattern.patternColor = $1',
    '\\.frontHair\\.setHeaddressPatternHeight\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].pattern.patternVerticalScale = $1',
    '\\.frontHair\\.setHeaddressPatternIntensity\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].pattern.patternVisibility = $1',
    '\\.frontHair\\.setHeaddressPatternTexture\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].pattern.patternStyle = $1',
    '\\.frontHair\\.setHeaddressPatternWidth\\((.*?)\\)': '.description.advance.hair.frontHair.accessories[index].pattern.patternHorizontalScale = $1',
    '\\.frontHair\\.setHighlightColor\\((.*?)\\)': '.description.advance.hair.frontHair.highlight.highlightStyle = $1',
    '\\.frontHair\\.setHighlightMask\\((.*?)\\)': '.description.advance.hair.frontHair.highlight.highlightStyle = $1',
    '\\.frontHair\\.setMesh\\((.*?)\\)': '.description.advance.hair.frontHair.style = $1',


    //HumanoidV2GlovesPart
    '\\.gloves\\.getColor\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].color.areaColor',
    '\\.gloves\\.getDesignAngle\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].design.designRotation',
    '\\.gloves\\.getDesignColor\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].design.designColor',
    '\\.gloves\\.getDesignTexture\((.*?)\)': '.description.advance.clothing.gloves.part[$1].design.designStyle',
    '\\.gloves\\.getMesh\\(\\)': '.description.advance.clothing.gloves.style',
    '\\.gloves\\.getPatternAngle\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].pattern.patternRotation',
    '\\.gloves\\.getPatternColor\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].pattern.patternColor',
    '\\.gloves\\.getPatternHeight\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].pattern.patternVerticalScale',
    '\\.gloves\\.getPatternIntensity\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].pattern.patternVisibility',
    '\\.gloves\\.getPatternWidth\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].pattern.patternHorizontalScale',
    '\\.gloves\\.getTexture\\((.*?)\\)': '.description.advance.clothing.gloves.part[$1].pattern.patternStyle',
    '\\.gloves\\.setColor\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].color.areaColor = $1',
    '\\.gloves\\.setDesignAngle\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].design.designRotation = $1',
    '\\.gloves\\.setDesignColor\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].design.designColor = $1',
    '\\.gloves\\.setDesignTexture\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].design.designStyle = $1',
    '\\.gloves\\.setMesh\\((.*?)\\)': '.description.advance.clothing.gloves.style = $1',
    '\\.gloves\\.setPatternAngle\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].pattern.patternRotation = $1',
    '\\.gloves\\.setPatternColor\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].pattern.patternColor = $1',
    '\\.gloves\\.setPatternHeight\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].pattern.patternVerticalScale = $1',
    '\\.gloves\\.setPatternIntensity\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].pattern.patternVisibility = $1',
    '\\.gloves\\.setPatternWidth\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].pattern.patternHorizontalScale = $1',
    '\\.gloves\\.setTexture\\((.*?)\\)': '.description.advance.clothing.gloves.part[index].pattern.patternStyle = $1',

    //HumanoidV2HairPart 无替换

    //HumanoidV2HeadPart
    //r'\.head\.characterFaceShadow' 无替换
    '\\.head\\.getBlushColor\\(\\)': '.description.advance.makeup.blush.blushColor',
    '\\.head\\.getBlushTexture\\(\\)': '.description.advance.makeup.blush.blushStyle',
    '\\.head\\.getBrowColor\\(\\)': '.description.advance.makeup.eyebrows.eyebrowColor',
    '\\.head\\.getBrowTexture\\(\\)': '.description.advance.makeup.eyebrows.eyebrowStyle',
    '\\.head\\.getExpression\\(\\)': '.description.advance.headFeatures.expressions.changeExpression',
    //getEyeHighlightColor getEyeHighlightTexture 无替换
    '\\.head\\.getEyeShadowColor\\(\\)': '.description.advance.makeup.eyeShadow.eyeshaowColor',
    '\\.head\\.getEyeShadowTexture\\(\\)': '.description.advance.makeup.eyeShadow.eyeshadowStyle',
    '\\.head\\.getEyeTexture\\(\\)': '.description.advance.makeup.coloredContacts.style.pupilStyle',
    '\\.head\\.getEyelashColor\\(\\)': '.description.advance.makeup.eyelashes.eyelashColor',
    '\\.head\\.getEyelashTexture\\(\\)': '.description.advance.makeup.eyelashes.eyelashStyle',
    '\\.head\\.getFacialTattooColor\\((.*?)\\)': '.description.advance.makeup.faceDecal[$1].decalColor',
    '\\.head\\.getFacialTattooPositionX\\((.*?)\\)': '.description.advance.makeup.faceDecal[$1].decalHorizontalShift',
    '\\.head\\.getFacialTattooPositionY\\((.*?)\\)': '.description.advance.makeup.faceDecal[$1].decalVerticalShift',
    '\\.head\\.getFacialTattooRotation\\((.*?)\\)': '.description.advance.makeup.faceDecal[$1].decalOverallRotation',
    '\\.head\\.getFacialTattooType\\((.*?)\\)': '.description.advance.makeup.faceDecal[$1].decalStyle',
    '\\.head\\.getFacialTattooZoom\\((.*?)\\)': '.description.advance.makeup.faceDecal[$1].decalOverallScale',
    '\\.head\\.getHeadPatternColor\\(\\)': '.description.advance.makeup.headDecal.decalColor',
    '\\.head\\.getHeadPatternTexture\\(\\)': '.description.advance.makeup.headDecal.decalStyle',
    '\\.head\\.getLeftEyeColor\\(\\)': '.description.advance.makeup.coloredContacts.style.leftPupilColor',
    '\\.head\\.getLipstickColor\\(\\)': '.description.advance.makeup.lipstick.lipstickColor',
    '\\.head\\.getLipstickTexture\\(\\)': '.description.advance.makeup.lipstick.lipstickStyle',
    '\\.head\\.getLowerEyeHighlightColor\\(\\)': '.description.advance.makeup.coloredContacts.highlight.lowerHighlightColor',
    '\\.head\\.getLowerEyeHighlightTexture\\(\\)': '.description.advance.makeup.coloredContacts.highlight.lowerHighlightStyle',
    '\\.head\\.getMesh\\(\\)': '.description.advance.headFeatures.head.style',
    '\\.head\\.getPupilColor\\(\\)': '.description.advance.makeup.coloredContacts.decal.pupilColor',
    '\\.head\\.getPupilPositionX\\(\\)': '.description.advance.makeup.coloredContacts.decal.pupilHorizontalPosition',
    '\\.head\\.getPupilPositionY\\(\\)': '.description.advance.makeup.coloredContacts.decal.pupilVerticalPosition',
    //r'\.?head.getPupilRotate\(\)': '.description.advance.makeup.coloredContacts.decal.pupilVerticalPosition', 无替换
    '\\.head\\.getPupilScale\\(\\)': '.description.advance.makeup.coloredContacts.decal.pupilSizeScale',
    '\\.head\\.getPupilTexture\\(\\)': '.description.advance.makeup.coloredContacts.decal.pupilStyle',
    '\\.head\\.getRightEyeColor\\(\\)': '.description.advance.makeup.coloredContacts.style.rightPupilColor',
    '\\.head\\.getUpperEyeHighlightColor\\(\\)': '.description.advance.makeup.coloredContacts.highlight.upperHighlightColor',
    '\\.head\\.getUpperEyeHighlightTexture\\(\\)': '.description.advance.makeup.coloredContacts.highlight.upperHighlightStyle',
    '\\.head\\.setBlushColor\\((.*?)\\)': '.description.advance.makeup.blush.blushColor = $1',
    '\\.head\\.setBlushTexture\\((.*?)\\)': '.description.advance.makeup.blush.blushStyle = $1',
    '\\.head\\.setBrowColor\\((.*?)\\)': '.description.advance.makeup.eyebrows.eyebrowColor = $1',
    '\\.head\\.setBrowTexture\\((.*?)\\)': '.description.advance.makeup.eyebrows.eyebrowStyle = $1',
    // setEyeHighlightColor setEyeHighlightTexture 无替换
    '\\.head\\.setEyeShadowColor\\((.*?)\\)': '.description.advance.makeup.eyeShadow.eyeshaowColor = $1',
    '\\.head\\.setEyeShadowTexture\((.*?)\)': '.description.advance.makeup.eyeShadow.eyeshadowStyle = $1',
    '\\.head\\.setEyeTexture\\((.*?)\\)': '.description.advance.makeup.coloredContacts.style.pupilStyle = $1',
    '\\.head\\.setEyelashColor\\((.*?)\\)': '.description.advance.makeup.eyelashes.eyelashColor = $1',
    '\\.head\\.setEyelashTexture\\((.*?)\\)': '.description.advance.makeup.eyelashes.eyelashStyle = $1',
    '\\.head\\.setFacialTattooColor\\((.*?)\\)': '.description.advance.makeup.faceDecal[index].decalColor = $1',
    '\\.head\\.setFacialTattooPositionX\\((.*?)\\)': '.description.advance.makeup.faceDecal[index].decalHorizontalShift = $1',
    '\\.head\\.setFacialTattooPositionY\\((.*?)\\)': '.description.advance.makeup.faceDecal[index].decalVerticalShift = $1',
    '\\.head\\.setFacialTattooRotation\\((.*?)\\)': '.description.advance.makeup.faceDecal[index].decalOverallRotation = $1',
    '\\.head\\.setFacialTattooType\\((.*?)\\)': '.description.advance.makeup.faceDecal[index].decalStyle = $1',
    '\\.head\\.setFacialTattooZoom\\((.*?)\\)': '.description.advance.makeup.faceDecal[index].decalOverallScale = $1',
    '\\.head\\.setHeadPatternColor\\((.*?)\\)': '.description.advance.makeup.headDecal.decalColor = $1',
    '\\.head\\.setHeadPatternTexture\\((.*?)\\)': '.description.advance.makeup.headDecal.decalStyle = $1',
    '\\.head\\.setLeftEyeColor\\((.*?)\\)': '.description.advance.makeup.coloredContacts.style.leftPupilColor = $1',
    '\\.head\\.setLipstickColor\\((.*?)\\)': '.description.advance.makeup.lipstick.lipstickColor = $1',
    '\\.head\\.setLipstickTexture\\((.*?)\\)': '.description.advance.makeup.lipstick.lipstickStyle = $1',
    '\\.head\\.setLowerEyeHighlightColor\\((.*?)\\)': '.description.advance.makeup.coloredContacts.highlight.lowerHighlightColor = $1',
    '\\.head\\.setLowerEyeHighlightTexture\\((.*?)\\)': '.description.advance.makeup.coloredContacts.highlight.lowerHighlightStyle = $1',
    '\\.head\\.setMesh\\((.*?)\\)': '.description.advance.headFeatures.head.style = $1',
    '\\.head\\.setPupilColor\\((.*?)\\)': '.description.advance.makeup.coloredContacts.decal.pupilColor = $1',
    '\\.head\\.setPupilPositionX\\((.*?)\\)': '.description.advance.makeup.coloredContacts.decal.pupilHorizontalPosition = $1',
    '\\.head\\.setPupilPositionY\\((.*?)\\)': '.description.advance.makeup.coloredContacts.decal.pupilVerticalPosition = $1',
    //setPupilRotate 无替换
    '\\.head\\.setPupilScale\\((.*?)\\)': '.description.advance.makeup.coloredContacts.decal.pupilSizeScale = $1',
    '\\.head\\.setPupilTexture\\((.*?)\\)': '.description.advance.makeup.coloredContacts.decal.pupilStyle = $1',
    '\\.head\\.setRightEyeColor\\((.*?)\\)': '.description.advance.makeup.coloredContacts.style.rightPupilColor = $1',
    '\\.head\\.setUpperEyeHighlightColor\\((.*?)\\)': '.description.advance.makeup.coloredContacts.highlight.upperHighlightColor = $1',
    '\\.head\\.setUpperEyeHighlightTexture\\((.*?)\\)': '.description.advance.makeup.coloredContacts.highlight.upperHighlightStyle = $1',

    //HumanoidV2LowerClothPart
    '\\.lowerCloth\\.getColor\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].color.areaColor',
    '\\.lowerCloth\\.getDesignAngle\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].design.designRotation',
    '\\.lowerCloth\\.getDesignColor\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].design.designColor',
    '\\.lowerCloth\\.getDesignTexture\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].design.designStyle',
    '\\.lowerCloth\\.getMesh\\(\\)': '.description.advance.clothing.lowerCloth.style',
    '\\.lowerCloth\\.getPatternAngle\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].pattern.patternRotation',
    '\\.lowerCloth\\.getPatternColor\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].pattern.patternColor',
    '\\.lowerCloth\\.getPatternHeight\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].pattern.patternVerticalScale',
    '\\.lowerCloth\\.getPatternIntensity\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].pattern.patternVisibility',
    '\\.lowerCloth\\.getPatternWidth\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].pattern.patternHorizontalScale',
    '\\.lowerCloth\\.getTexture\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[$1].pattern.patternStyle',
    '\\.lowerCloth\\.setColor\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].color.areaColor = $1',
    '\\.lowerCloth\\.setDesignAngle\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].design.designRotation = $1',
    '\\.lowerCloth\\.setDesignColor\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].design.designColor = $1',
    '\\.lowerCloth\\.setDesignTexture\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].design.designStyle = $1',
    '\\.lowerCloth\\.setMesh\\((.*?)\\)': '.description.advance.clothing.lowerCloth.style = $1',
    '\\.lowerCloth\\.setPatternAngle\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].pattern.patternRotation = $1',
    '\\.lowerCloth\\.setPatternColor\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].pattern.patternColor = $1',
    '\\.lowerCloth\\.setPatternHeight\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].pattern.patternVerticalScale = $1',
    '\\.lowerCloth\\.setPatternIntensity\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].pattern.patternVisibility = $1',
    '\\.lowerCloth\\.setPatternWidth\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].pattern.patternHorizontalScale = $1',
    '\\.lowerCloth\\.setTexture\\((.*?)\\)': '.description.advance.clothing.lowerCloth.part[index].pattern.patternStyle = $1',

    //HumanoidV2Shape
    '\\.shape\\.getBreastHorizontalPosition\\(\\)': '.description.advance.bodyFeatures.breast.breastHorizontalShift',
    '\\.shape\\.getBreastLength\\(\\)': '.description.advance.bodyFeatures.breast.breastLength',
    '\\.shape\\.getBreastScale\\(\\)': '.description.advance.bodyFeatures.breast.breastOverallScale',
    '\\.shape\\.getBreastStretch\\(\\)': '.description.advance.bodyFeatures.chest.chestVerticalScale',
    '\\.shape\\.getBreastVerticalPosition\\(\\)': '.description.advance.bodyFeatures.breast.breastVerticalShift',
    '\\.shape\\.getBrowGap\\(\\)': '.description.advance.headFeatures.eyebrows.eyebrowHorizontalShift',
    '\\.shape\\.getBrowHeight\\(\\)': '.description.advance.headFeatures.eyebrows.eyebrowVerticalShift',
    '\\.shape\\.getBrowInboardShape\\(\\)': '.description.advance.headFeatures.eyebrows.eyebrowInnerVerticalShift',
    '\\.shape\\.getBrowOutsideShape\\(\\)': '.description.advance.headFeatures.eyebrows.eyebrowOuterVerticalShift',
    '\\.shape\\.getBrowRotation\\(\\)': '.description.advance.headFeatures.eyebrows.eyebrowOverallRotation',
    '\\.shape\\.getCanthusHorizontalPosition\\(\\)': '.description.advance.headFeatures.eyes.eyeCorners.outerEyeCornerVerticalShift',
    '\\.shape\\.getCanthusVerticalPosition\\(\\)': '.description.advance.headFeatures.eyes.eyeCorners.innerEyeCornerHorizontalShift',
    '\\.shape\\.getCharacterHeight\\(\\)': '.description.advance.bodyFeatures.body.height',
    '\\.shape\\.getCheekBoneRange\\(\\)': '.description.advance.headFeatures.faceShape.cheekbone.cheekboneFrontalShift',
    '\\.shape\\.getCheekBoneWidth\\(\\)': '.description.advance.headFeatures.faceShape.cheekbone.cheekboneHorizontalScale',
    '\\.shape\\.getCheekHeight\\(\\)': '.description.advance.headFeatures.faceShape.cheek.cheekVerticalShift',
    '\\.shape\\.getCheekRange\\(\\)': '.description.advance.headFeatures.faceShape.cheek.cheekFrontalShift',
    '\\.shape\\.getCheekWidth\\(\\)': '.description.advance.headFeatures.faceShape.cheek.cheekHorizontalScale',
    '\\.shape\\.getEarRoll\\(\\)': '.description.advance.headFeatures.ears.earHorizontalRotation',
    '\\.shape\\.getEarScale\\(\\)': '.description.advance.headFeatures.ears.earOverallScale',
    '\\.shape\\.getEarYaw\\(\\)': '.description.advance.headFeatures.ears.earFrontalRotation',
    '\\.shape\\.getEyesGap\\(\\)': '.description.advance.headFeatures.eyes.overall.eyeHorizontalShift',
    '\\.shape\\.getEyesHeight\\(\\)': '.description.advance.headFeatures.eyes.overall.eyeVerticalShift',
    '\\.shape\\.getEyesLength\\(\\)': '.description.advance.headFeatures.eyes.overall.eyeVerticalScale',
    '\\.shape\\.getEyesRange\\(\\)': '.description.advance.headFeatures.eyes.overall.eyeFrontalShift',
    '\\.shape\\.getEyesRotation\\(\\)': '.description.advance.headFeatures.eyes.overall.eyeOverallRotation',
    '\\.shape\\.getEyesWidth\\(\\)': '.description.advance.headFeatures.eyes.overall.eyeHorizontalScale',
    '\\.shape\\.getFaceWidth\\(\\)': '.description.advance.headFeatures.faceShape.overall.faceHorizontalScale',
    '\\.shape\\.getFootScale\\(\\)': '.description.advance.bodyFeatures.feet.feetOverallScale',
    '\\.shape\\.getGroinThickness\\(\\)': '.description.advance.bodyFeatures.hips.hipFrontalScale',
    '\\.shape\\.getGroinWidth\\(\\)': '.description.advance.bodyFeatures.hips.hipHorizontalScale',
    '\\.shape\\.getHandScale\\(\\)': '.description.advance.bodyFeatures.hands.handOverallScale',
    '\\.shape\\.getHeadScale\\(\\)': '.description.advance.headFeatures.head.headOverallScale',
    '\\.shape\\.getJawLength\\(\\)': '.description.advance.headFeatures.faceShape.jawline.jawlineVerticalShift',
    '\\.shape\\.getJawRange\\(\\)': '.description.advance.headFeatures.faceShape.chin.chinFrontalShift',
    '\\.shape\\.getJawSmooth\\(\\)': '.description.advance.headFeatures.faceShape.jawline.jawlineRoundness',
    '\\.shape\\.getJawVertexHeight\\(\\)': '.description.advance.headFeatures.faceShape.chin.chinTipVerticalShift',
    '\\.shape\\.getJawVertexRange\\(\\)': '.description.advance.headFeatures.faceShape.chin.chinTipFrontalShift',
    '\\.shape\\.getJawVertexWidth\\(\\)': '.description.advance.headFeatures.faceShape.chin.chinTipHorizontalScale',
    '\\.shape\\.getLowerArmsStretch\\(\\)': '.description.advance.bodyFeatures.arms.forearmVerticalScale',
    '\\.shape\\.getLowerArmsThickness\\(\\)': '.description.advance.bodyFeatures.arms.forearmFrontalScale',
    '\\.shape\\.getLowerArmsWidth\\(\\)': '.description.advance.bodyFeatures.arms.forearmHorizontalScale',
    '\\.shape\\.getLowerFaceRange\\(\\)': '.description.advance.headFeatures.faceShape.overall.lowerFaceFrontalShift',
    '\\.shape\\.getLowerFaceWidth\\(\\)': '.description.advance.headFeatures.faceShape.overall.lowerFaceHorizontalScale',
    '\\.shape\\.getLowerJawRange\\(\\)': '.description.advance.headFeatures.faceShape.jawline.jawFrontalShift',
    '\\.shape\\.getLowerJawWidth\\(\\)': '.description.advance.headFeatures.faceShape.jawline.jawHorizontalScale',
    '\\.shape\\.getLowerMouthThickness\\(\\)': '.description.advance.headFeatures.mouth.lips.lowerLipThickness',
    '\\.shape\\.getLowerStretch\\(\\)': '.description.advance.headFeatures.ears.earLowerScale',
    '\\.shape\\.getMouthHeight\\(\\)': '.description.advance.headFeatures.mouth.overall.mouthVerticalShift',
    '\\.shape\\.getMouthRange\\(\\)': '.description.advance.headFeatures.mouth.overall.mouthFrontalShift',
    '\\.shape\\.getMouthShape\\(\\)': '.description.advance.headFeatures.mouth.mouthCorners.mouthCornerVerticalShift',
    '\\.shape\\.getMouthWidth\\(\\)': '.description.advance.headFeatures.mouth.overall.mouthHorizontalScale',
    '\\.shape\\.getNeckStretch\\(\\)': '.description.advance.bodyFeatures.neck.neckVerticalScale',
    '\\.shape\\.getNeckThickness\\(\\)': '.description.advance.bodyFeatures.neck.neckFrontalScale',
    '\\.shape\\.getNeckWidth\\(\\)': '.description.advance.bodyFeatures.neck.neckHorizontalScale',
    '\\.shape\\.getNoseHeight\\(\\)': '.description.advance.headFeatures.nose.noseBridge.noseBridgeFrontalShift',
    '\\.shape\\.getNoseProtrusion\\(\\)': '.description.advance.headFeatures.nose.noseTip.noseTipVerticalShift',
    '\\.shape\\.getNoseVerticalPosition\\(\\)': '.description.advance.headFeatures.nose.overall.noseOverallVerticalShift',
    '\\.shape\\.getPupilHeight\\(\\)': '.description.advance.headFeatures.eyes.pupils.pupilVerticalScale',
    '\\.shape\\.getPupilHorizontalPosition\\(\\)': '.description.advance.headFeatures.eyes.pupils.pupilHorizontalShift',
    '\\.shape\\.getPupilVerticalPosition\\(\\)': '.description.advance.headFeatures.eyes.pupils.pupilVerticalShift',
    '\\.shape\\.getPupilWidth\\(\\)': '.description.advance.headFeatures.eyes.pupils.pupilHorizontalScale',
    '\\.shape\\.getRibThickness\\(\\)': '.description.advance.bodyFeatures.ribs.ribFrontalScale',
    '\\.shape\\.getRibWidth\\(\\)': '.description.advance.bodyFeatures.ribs.ribHorizontalScale',
    '\\.shape\\.getShankScaleX\\(\\)': '.description.advance.bodyFeatures.legs.calfHorizontalScale',
    '\\.shape\\.getShankScaleZ\\(\\)': '.description.advance.bodyFeatures.legs.calfFrontalScale',
    '\\.shape\\.getShankStretch\\(\\)': '.description.advance.bodyFeatures.legs.calfVerticalScale',
    '\\.shape\\.getShoulderArmThickness\\(\\)': '.description.advance.bodyFeatures.arms.shoulderFrontalScale',
    '\\.shape\\.getShoulderArmWidth\\(\\)': '.description.advance.bodyFeatures.arms.shoulderHorizontalScale',
    '\\.shape\\.getShoulderThickness\\(\\)': '.description.advance.bodyFeatures.chest.chestFrontalScale',
    '\\.shape\\.getShoulderWidth\\(\\)': '.description.advance.bodyFeatures.chest.chestHorizontalScale',
    '\\.shape\\.getThighStretch\\(\\)': '.description.advance.bodyFeatures.legs.thighVerticalScale',
    '\\.shape\\.getThighThicknessX\\(\\)': '.description.advance.bodyFeatures.legs.thighHorizontalScale',
    '\\.shape\\.getThighThicknessZ\\(\\)': '.description.advance.bodyFeatures.legs.thighFrontalScale',
    '\\.shape\\.getUpperArmsStretch\\(\\)': '.description.advance.bodyFeatures.arms.upperArmVerticalScale',
    '\\.shape\\.getUpperArmsThickness\\(\\)': '.description.advance.bodyFeatures.arms.upperArmFrontalScale',
    '\\.shape\\.getUpperArmsWidth\\(\\)': '.description.advance.bodyFeatures.arms.upperArmHorizontalScale',
    '\\.shape\\.getUpperFaceRange\\(\\)': '.description.advance.headFeatures.faceShape.overall.upperFaceFrontalShift',
    '\\.shape\\.getUpperMouthThickness\\(\\)': '.description.advance.headFeatures.mouth.lips.upperLipThickness',
    '\\.shape\\.getUpperStretch\\(\\)': '.description.advance.headFeatures.ears.earUpperScale',
    '\\.shape\\.getWaistStretch\\(\\)': '.description.advance.bodyFeatures.waist.waistVerticalScale',
    '\\.shape\\.getWaistThickness\\(\\)': '.description.advance.bodyFeatures.waist.waistFrontalScale',
    '\\.shape\\.getWaistWidth\\(\\)': '.description.advance.bodyFeatures.waist.waistHorizontalScale',


    '\\.shape\\.setBreastHorizontalPosition\\((.*?)\\)': '.description.advance.bodyFeatures.breast.breastHorizontalShift = $1',
    '\\.shape\\.setBreastLength\\((.*?)\\)': '.description.advance.bodyFeatures.breast.breastLength = $1',
    '\\.shape\\.setBreastScale\\((.*?)\\)': '.description.advance.bodyFeatures.breast.breastOverallScale = $1',
    '\\.shape\\.setBreastStretch\\((.*?)\\)': '.description.advance.bodyFeatures.chest.chestVerticalScale = $1',
    '\\.shape\\.setBreastVerticalPosition\\((.*?)\\)': '.description.advance.bodyFeatures.breast.breastVerticalShift = $1',
    '\\.shape\\.setBrowGap\\((.*?)\\)': '.description.advance.headFeatures.eyebrows.eyebrowHorizontalShift = $1',
    '\\.shape\\.setBrowHeight\\((.*?)\\)': '.description.advance.headFeatures.eyebrows.eyebrowVerticalShift = $1',
    '\\.shape\\.setBrowInboardShape\\((.*?)\\)': '.description.advance.headFeatures.eyebrows.eyebrowInnerVerticalShift = $1',
    '\\.shape\\.setBrowOutsideShape\\((.*?)\\)': '.description.advance.headFeatures.eyebrows.eyebrowOuterVerticalShift = $1',
    '\\.shape\\.setBrowRotation\\((.*?)\\)': '.description.advance.headFeatures.eyebrows.eyebrowOverallRotation = $1',
    '\\.shape\\.setCanthusHorizontalPosition\\((.*?)\\)': '.description.advance.headFeatures.eyes.eyeCorners.outerEyeCornerVerticalShift = $1',
    '\\.shape\\.setCanthusVerticalPosition\\((.*?)\\)': '.description.advance.headFeatures.eyes.eyeCorners.innerEyeCornerHorizontalShift = $1',
    '\\.shape\\.setCharacterHeight\\((.*?)\\)': '.description.advance.bodyFeatures.body.height = $1',
    '\\.shape\\.setCheekBoneRange\\((.*?)\\)': '.description.advance.headFeatures.faceShape.cheekbone.cheekboneFrontalShift = $1',
    '\\.shape\\.setCheekBoneWidth\\((.*?)\\)': '.description.advance.headFeatures.faceShape.cheekbone.cheekboneHorizontalScale = $1',
    '\\.shape\\.setCheekHeight\\((.*?)\\)': '.description.advance.headFeatures.faceShape.cheek.cheekVerticalShift = $1',
    '\\.shape\\.setCheekRange\\((.*?)\\)': '.description.advance.headFeatures.faceShape.cheek.cheekFrontalShift = $1',
    '\\.shape\\.setCheekWidth\\((.*?)\\)': '.description.advance.headFeatures.faceShape.cheek.cheekHorizontalScale = $1',
    '\\.shape\\.setEarRoll\\((.*?)\\)': '.description.advance.headFeatures.ears.earHorizontalRotation = $1',
    '\\.shape\\.setEarScale\\((.*?)\\)': '.description.advance.headFeatures.ears.earOverallScale = $1',
    '\\.shape\\.setEarYaw\\((.*?)\\)': '.description.advance.headFeatures.ears.earFrontalRotation = $1',
    '\\.shape\\.setEyesGap\\((.*?)\\)': '.description.advance.headFeatures.eyes.overall.eyeHorizontalShift = $1',
    '\\.shape\\.setEyesHeight\\((.*?)\\)': '.description.advance.headFeatures.eyes.overall.eyeVerticalShift = $1',
    '\\.shape\\.setEyesLength\\((.*?)\\)': '.description.advance.headFeatures.eyes.overall.eyeVerticalScale = $1',
    '\\.shape\\.setEyesRange\\((.*?)\\)': '.description.advance.headFeatures.eyes.overall.eyeFrontalShift = $1',
    '\\.shape\\.setEyesRotation\\((.*?)\\)': '.description.advance.headFeatures.eyes.overall.eyeOverallRotation = $1',
    '\\.shape\\.setEyesWidth\\((.*?)\\)': '.description.advance.headFeatures.eyes.overall.eyeHorizontalScale = $1',
    '\\.shape\\.setFaceWidth\\((.*?)\\)': '.description.advance.headFeatures.faceShape.overall.faceHorizontalScale = $1',
    '\\.shape\\.setFootScale\\((.*?)\\)': '.description.advance.bodyFeatures.feet.feetOverallScale = $1',
    '\\.shape\\.setGroinThickness\\((.*?)\\)': '.description.advance.bodyFeatures.hips.hipFrontalScale = $1',
    '\\.shape\\.setGroinWidth\\((.*?)\\)': '.description.advance.bodyFeatures.hips.hipHorizontalScale = $1',
    '\\.shape\\.setHandScale\\((.*?)\\)': '.description.advance.bodyFeatures.hands.handOverallScale = $1',
    '\\.shape\\.setHeadScale\\((.*?)\\)': '.description.advance.headFeatures.head.headOverallScale = $1',
    '\\.shape\\.setJawLength\\((.*?)\\)': '.description.advance.headFeatures.faceShape.jawline.jawlineVerticalShift = $1',
    '\\.shape\\.setJawRange\\((.*?)\\)': '.description.advance.headFeatures.faceShape.chin.chinFrontalShift = $1',
    '\\.shape\\.setJawSmooth\\((.*?)\\)': '.description.advance.headFeatures.faceShape.jawline.jawlineRoundness = $1',
    '\\.shape\\.setJawVertexHeight\\((.*?)\\)': '.description.advance.headFeatures.faceShape.chin.chinTipVerticalShift = $1',
    '\\.shape\\.setJawVertexRange\\((.*?)\\)': '.description.advance.headFeatures.faceShape.chin.chinTipFrontalShift = $1',
    '\\.shape\\.setJawVertexWidth\\((.*?)\\)': '.description.advance.headFeatures.faceShape.chin.chinTipHorizontalScale = $1',
    '\\.shape\\.setLowerArmsStretch\\((.*?)\\)': '.description.advance.bodyFeatures.arms.forearmVerticalScale = $1',
    '\\.shape\\.setLowerArmsThickness\\((.*?)\\)': '.description.advance.bodyFeatures.arms.forearmFrontalScale = $1',
    '\\.shape\\.setLowerArmsWidth\\((.*?)\\)': '.description.advance.bodyFeatures.arms.forearmHorizontalScale = $1',
    '\\.shape\\.setLowerFaceRange\\((.*?)\\)': '.description.advance.headFeatures.faceShape.overall.lowerFaceFrontalShift = $1',
    '\\.shape\\.setLowerFaceWidth\\((.*?)\\)': '.description.advance.headFeatures.faceShape.overall.lowerFaceHorizontalScale = $1',
    '\\.shape\\.setLowerJawRange\\((.*?)\\)': '.description.advance.headFeatures.faceShape.jawline.jawFrontalShift = $1',
    '\\.shape\\.setLowerJawWidth\\((.*?)\\)': '.description.advance.headFeatures.faceShape.jawline.jawHorizontalScale = $1',
    '\\.shape\\.setLowerMouthThickness\\((.*?)\\)': '.description.advance.headFeatures.mouth.lips.lowerLipThickness = $1',
    '\\.shape\\.setLowerStretch\\((.*?)\\)': '.description.advance.headFeatures.ears.earLowerScale = $1',
    '\\.shape\\.setMouthHeight\\((.*?)\\)': '.description.advance.headFeatures.mouth.overall.mouthVerticalShift = $1',
    '\\.shape\\.setMouthRange\\((.*?)\\)': '.description.advance.headFeatures.mouth.overall.mouthFrontalShift = $1',
    '\\.shape\\.setMouthShape\\((.*?)\\)': '.description.advance.headFeatures.mouth.mouthCorners.mouthCornerVerticalShift = $1',
    '\\.shape\\.setMouthWidth\\((.*?)\\)': '.description.advance.headFeatures.mouth.overall.mouthHorizontalScale = $1',
    '\\.shape\\.setNeckStretch\\((.*?)\\)': '.description.advance.bodyFeatures.neck.neckVerticalScale = $1',
    '\\.shape\\.setNeckThickness\\((.*?)\\)': '.description.advance.bodyFeatures.neck.neckFrontalScale = $1',
    '\\.shape\\.setNeckWidth\\((.*?)\\)': '.description.advance.bodyFeatures.neck.neckHorizontalScale = $1',
    '\\.shape\\.setNoseHeight\\((.*?)\\)': '.description.advance.headFeatures.nose.noseBridge.noseBridgeFrontalShift = $1',
    '\\.shape\\.setNoseProtrusion\\((.*?)\\)': '.description.advance.headFeatures.nose.noseTip.noseTipVerticalShift = $1',
    '\\.shape\\.setNoseVerticalPosition\\((.*?)\\)': '.description.advance.headFeatures.nose.overall.noseOverallVerticalShift = $1',
    '\\.shape\\.setPupilHeight\\((.*?)\\)': '.description.advance.headFeatures.eyes.pupils.pupilVerticalScale = $1',
    '\\.shape\\.setPupilHorizontalPosition\\((.*?)\\)': '.description.advance.headFeatures.eyes.pupils.pupilHorizontalShift = $1',
    '\\.shape\\.setPupilVerticalPosition\\((.*?)\\)': '.description.advance.headFeatures.eyes.pupils.pupilVerticalShift = $1',
    '\\.shape\\.setPupilWidth\\((.*?)\\)': '.description.advance.headFeatures.eyes.pupils.pupilHorizontalScale = $1',
    '\\.shape\\.setRibThickness\\((.*?)\\)': '.description.advance.bodyFeatures.ribs.ribFrontalScale = $1',
    '\\.shape\\.setRibWidth\\((.*?)\\)': '.description.advance.bodyFeatures.ribs.ribHorizontalScale = $1',
    '\\.shape\\.setShankScaleX\\((.*?)\\)': '.description.advance.bodyFeatures.legs.calfHorizontalScale = $1',
    '\\.shape\\.setShankScaleZ\\((.*?)\\)': '.description.advance.bodyFeatures.legs.calfFrontalScale = $1',
    '\\.shape\\.setShankStretch\\((.*?)\\)': '.description.advance.bodyFeatures.legs.calfVerticalScale = $1',
    '\\.shape\\.setShoulderArmThickness\\((.*?)\\)': '.description.advance.bodyFeatures.arms.shoulderFrontalScale = $1',
    '\\.shape\\.setShoulderArmWidth\\((.*?)\\)': '.description.advance.bodyFeatures.arms.shoulderHorizontalScale = $1',
    '\\.shape\\.setShoulderThickness\\((.*?)\\)': '.description.advance.bodyFeatures.chest.chestFrontalScale = $1',
    '\\.shape\\.setShoulderWidth\\((.*?)\\)': '.description.advance.bodyFeatures.chest.chestHorizontalScale = $1',
    '\\.shape\\.setThighStretch\\((.*?)\\)': '.description.advance.bodyFeatures.legs.thighVerticalScale = $1',
    '\\.shape\\.setThighThicknessX\\((.*?)\\)': '.description.advance.bodyFeatures.legs.thighHorizontalScale = $1',
    '\\.shape\\.setThighThicknessZ\\((.*?)\\)': '.description.advance.bodyFeatures.legs.thighFrontalScale = $1',
    '\\.shape\\.setUpperArmsStretch\\((.*?)\\)': '.description.advance.bodyFeatures.arms.upperArmVerticalScale = $1',
    '\\.shape\\.setUpperArmsThickness\\((.*?)\\)': '.description.advance.bodyFeatures.arms.upperArmFrontalScale = $1',
    '\\.shape\\.setUpperArmsWidth\\((.*?)\\)': '.description.advance.bodyFeatures.arms.upperArmHorizontalScale = $1',
    '\\.shape\\.setUpperFaceRange\\((.*?)\\)': '.description.advance.headFeatures.faceShape.overall.upperFaceFrontalShift = $1',
    '\\.shape\\.setUpperMouthThickness\\((.*?)\\)': '.description.advance.headFeatures.mouth.lips.upperLipThickness = $1',
    '\\.shape\\.setUpperStretch\\((.*?)\\)': '.description.advance.headFeatures.ears.earUpperScale = $1',
    '\\.shape\\.setWaistStretch\\((.*?)\\)': '.description.advance.bodyFeatures.waist.waistVerticalScale = $1',
    '\\.shape\\.setWaistThickness\\((.*?)\\)': '.description.advance.bodyFeatures.waist.waistFrontalScale = $1',
    '\\.shape\\.setWaistWidth\\((.*?)\\)': '.description.advance.bodyFeatures.waist.waistHorizontalScale = $1',


    //HumanoidV2ShoePart
    '\\.shoe\\.getColor\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].color.areaColor',
    '\\.shoe\\.getDesignAngle\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].design.designRotation',
    '\\.shoe\\.getDesignColor\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].design.designColor',
    '\\.shoe\\.getDesignTexture\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].design.designStyle',
    '\\.shoe\\.getMesh\\(\\)': '.description.advance.clothing.shoes.style',
    '\\.shoe\\.getPatternAngle\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].pattern.patternRotation',
    '\\.shoe\\.getPatternColor\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].pattern.patternColor',
    '\\.shoe\\.getPatternHeight\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].pattern.patternVerticalScale',
    '\\.shoe\\.getPatternIntensity\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].pattern.patternVisibility',
    '\\.shoe\\.getPatternWidth\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].pattern.patternHorizontalScale',
    '\\.shoe\\.getTexture\\((.*?)\\)': '.description.advance.clothing.shoes.part[$1].pattern.patternStyle',

    '\\.shoe\\.setColor\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].color.areaColor = $1',
    '\\.shoe\\.setDesignAngle\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].design.designRotation = $1',
    '\\.shoe\\.setDesignColor\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].design.designColor = $1',
    '\\.shoe\\.setDesignTexture\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].design.designStyle = $1',
    '\\.shoe\\.setMesh\\((.*?)\\)': '.description.advance.clothing.shoes.style = $1',
    '\\.shoe\\.setPatternAngle\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].pattern.patternRotation = $1',
    '\\.shoe\\.setPatternColor\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].pattern.patternColor = $1',
    '\\.shoe\\.setPatternHeight\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].pattern.patternVerticalScale = $1',
    '\\.shoe\\.setPatternIntensity\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].pattern.patternVisibility = $1',
    '\\.shoe\\.setPatternWidth\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].pattern.patternHorizontalScale = $1',
    '\\.shoe\\.setTexture\\((.*?)\\)': '.description.advance.clothing.shoes.part[index].pattern.patternStyle = $1',


    // HumanoidV2UpperClothPart
    '\\.upperCloth\\.getColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].color.areaColor',
    '\\.upperCloth\\.getDesignAngle\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].design.designRotation',
    '\\.upperCloth\\.getDesignColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].design.designColor',
    '\\.upperCloth\\.getDesignTexture\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].design.designStyle',
    '\\.upperCloth\\.getMesh\\(\\)': '.description.advance.clothing.upperCloth.style',
    '\\.upperCloth\\.getPatternAngle\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].pattern.patternRotation',
    '\\.upperCloth\\.getPatternColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].pattern.patternColor',
    '\\.upperCloth\\.getPatternHeight\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].pattern.patternVerticalScale',
    '\\.upperCloth\\.getPatternIntensity\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].pattern.patternVisibility',
    '\\.upperCloth\\.getPatternWidth\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].pattern.patternHorizontalScale',
    '\\.upperCloth\\.getTexture\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].pattern.patternStyle',
    '\\.upperCloth\\.getUpperClothClothColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[$1].color.areaColor',
    '\\.upperCloth\\.setColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].color.areaColor = $1',
    '\\.upperCloth\\.setDesignAngle\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].design.designRotation = $1',
    '\\.upperCloth\\.setDesignColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].design.designColor = $1',
    '\\.upperCloth\\.setDesignTexture\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].design.designStyle = $1',
    '\\.upperCloth\\.setMesh\\((.*?)\\)': '.description.advance.clothing.upperCloth.style = $1',
    '\\.upperCloth\\.setPatternAngle\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].pattern.patternRotation = $1',
    '\\.upperCloth\\.setPatternColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].pattern.patternColor = $1',
    '\\.upperCloth\\.setPatternHeight\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].pattern.patternVerticalScale = $1',
    '\\.upperCloth\\.setPatternIntensity\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].pattern.patternVisibility = $1',
    '\\.upperCloth\\.setPatternWidth\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].pattern.patternHorizontalScale = $1',
    '\\.upperCloth\\.setTexture\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].pattern.patternStyle = $1',
    '\\.upperCloth\\.setUpperClothClothColor\\((.*?)\\)': '.description.advance.clothing.upperCloth.part[index].color.areaColor = $1',


    //characterbase
    //'.appearanceReady': ''  #无替换方案
    '\\.appearanceType': '.characterType',
    '\\.onLoadAppearanceDataAllCompleted': '.onDescriptionComplete',
    '\\.onLoadDecorationsAllCompleted': '.onDescriptionComplete', //回调参数不一致
    '\\.onMeshChanged': '.onDescriptionChange', //回调参数不一致
    '\\.onSetAppearanceDataCompleted\\.': '.onDescriptionComplete', //回调参数不一致
    '\\.onTextureChanged': '.onDescriptionChange', //回调参数不一致
    '\\.setAppearance\\(': '.setDescription(',

    //DefaultData 无替换

    //FourFootStandard 
    '\\.getWholeBody': '.description.base.wholeBody',
    '\\.setWholeBody': '.description.base.wholeBody = ', //参数不一致 没有同步的参数 

    //HumanoidV2
    '\\.appearanceSync\\(\\)': '.syncDescription()',
    '\\.attach\\(': '.attachToSlot(',
    '\\.changeSomatotype': '.description.advance.base.characterSetting.somatotype = ', //参数不一致 没有同步的参数
    '\\.clearAppearance\\(\\)': '.clearDescription()',
    '\\.detach\\(': '.detachFromSlot(',
    '\\.getBodyTattooColor\\((.*?)\\)': '.description.advance.makeup.bodyDecal[$1].decalColor()',
    '\\.getBodyTattooPositionX\\((.*?)\\)': '.description.advance.makeup.bodyDecal[$1].decalHorizontalShift',
    '\\.getBodyTattooPositionY\\((.*?)\\)': '.description.advance.makeup.bodyDecal[$1].decalVerticalShift',
    '\\.getBodyTattooRotation\\((.*?)\\)': '.description.advance.makeup.bodyDecal[$1].decalOverallRotation',
    '\\.getBodyTattooType\\((.*?)\\)': '.description.advance.makeup.bodyDecal[$1].decalStyle',
    '\\.getBodyTattooZoom\\((.*?)\\)': '.description.advance.makeup.bodyDecal[$1].decalOverallScale',

    //getGoods 无替换
    '\\.getSkinColor\\(\\)': '.description.advance.makeup.skinTone.skinColor',
    //getSkinTexture 无替换
    '\\.getSlotWorldPosition\\((.*?)\\)': '.getSlotWorldPosition($1)',
    '\\.getSomatotype\\(\\)': '.description.advance.base.characterSetting.somatotype',
    '\\.getVertexPosition\\((.*?)\\)': '.getVertexPosition($1)',
    '\\.setAppearanceData\\(': '.setDescription(', //参数不一致 无回调
    '\\.setBodyTattooColor': '.description.advance.makeup.bodyDecal[index].decalColor = ', //参数不一致 缺同步
    '\\.setBodyTattooPositionX': '.description.advance.makeup.bodyDecal[index].decalHorizontalShift = ', //参数不一致 缺同步
    '\\.setBodyTattooPositionY': '.description.advance.makeup.bodyDecal[index].decalVerticalShift = ', //参数不一致 缺同步
    '\\.setBodyTattooRotation': '.description.advance.makeup.bodyDecal[index].decalOverallRotation = ', //参数不一致 缺同步
    '\\.setBodyTattooType': '.description.advance.makeup.bodyDecal[index].decalStyle = ', //参数不一致 缺同步
    '\\.setBodyTattooZoom': '.description.advance.makeup.bodyDecal[index].decalOverallScale = ', //参数不一致 缺同步
    '\\.setSkinColor': '.description.advance.makeup.skinTone.skinColor = ', //参数不一致 缺同步

    '\\bAccountService\\.getInstance\\(\\)': 'AccountService',
    '\\bGameObjPool\\.getInstance\\(\\)': 'GameObjPool',
    '\\bDataCenterC\\.getInstance\\(\\)': 'DataCenterC',
    '\\bDataCenterS\\.getInstance\\(\\)': 'DataCenterS',
    '\\bModuleManager\\.getInstance\\(\\)': 'ModuleService',
    '\\bAdsService\\.getInstance\\(\\)': 'AdsService',
    '\\bAnalyticsService\\.getInstance\\(\\)': 'AnalyticsService',
    '\\bDebugService\\.getInstance\\(\\)': 'DebugService',
    '\\bEffectService\\.getInstance\\(\\)': 'EffectService',
    '\\bMessageChannelService\\.getInstance\\(\\)': 'MessageChannelService',
    '\\bPurchaseService\\.getInstance\\(\\)': 'PurchaseService',
    '\\bRoomService\\.getInstance\\(\\)': 'RoomService',
    '\\bRouteService\\.getInstance\\(\\)': 'RouteService',
    '\\bSoundService\\.getInstance\\(\\)': 'SoundService',
    '\\bUGCService\\.getInstance\\(\\)': 'UGCService',
    '\\bChatService\\.getInstance\\(\\)': 'ChatService',
    '\\bUIManager\\.instance': 'UIService',

    //getInstance去除 end


    //命名空间修改 start

    "\\bModuleManager\\.": "ModuleService.",
    "\\bUtil\\.": "mw.",
    "\\bType\\.": "mw.",
    "\\bCore\\.": "mw.",
    "\\bUI\\.": "mw.",
    "\\bService\\.": "mw.",
    "\\bEvents\\.": "mw.",
    "\\bMobileEditor\\.": "mw.",
    "\\bExtension\\.": "mwext.",
    "\\bNetwork\\.": "mw.",
    "mw\\.GameObjPool\\.": "GameObjPool.",
    "\\bGameplay\\.": "mw.",
    '\\bUtil\\.': 'mw.',
    'mw\\.EffectService': 'EffectService',

    //命名空间修改 end

    //Camera start

    'mw\\.getCurrentPlayer\\(\\)': 'Player.localPlayer',

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.cameraSystem\\b": "Camera.currentCamera",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.cameraSystem\\b": "Camera.currentCamera",
    "(\\w+)\\.(\\w+)\\.cameraSystem\\b": "Camera.currentCamera",
    "(\\w+)\\.cameraSystem\\b": "Camera.currentCamera",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.startCameraShake\\(": "ModifiedCameraSystem.startCameraShake(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.startCameraShake\\(": "ModifiedCameraSystem.startCameraShake(",
    "(\\w+)\\.(\\w+)\\.startCameraShake\\(": "ModifiedCameraSystem.startCameraShake(",
    "(\\w+)\\.startCameraShake\\(": "ModifiedCameraSystem.startCameraShake(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.stopCameraShake\\(": "Camera.stopShake(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.stopCameraShake\\(": "Camera.stopShake(",
    "(\\w+)\\.(\\w+)\\.stopCameraShake\\(": "Camera.stopShake(",
    "(\\w+)\\.stopCameraShake\\(": "Camera.stopShake(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.applySettings\\(": "ModifiedCameraSystem.applySettings(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.applySettings\\(": "ModifiedCameraSystem.applySettings(",
    "(\\w+)\\.(\\w+)\\.applySettings\\(": "ModifiedCameraSystem.applySettings(",
    "(\\w+)\\.applySettings\\(": "ModifiedCameraSystem.applySettings(",


    '\\.cameraCollisionEnable\\b': '.springArm.collisionEnabled',
    '\\.cameraCollisionInterpSpeed\\b': '.collisionInterpSpeed',
    '\\.cameraDownLimitAngle\\b': '.downAngleLimit',
    '\\.cameraLocationLagEnable\\b': '.positionLagEnabled',
    '\\.cameraLocationLagSpeed\\b': '.positionLagSpeed',
    '\\.cameraLocationMode\\b': '.positionMode',
    '\\.cameraFOV\\b': '.fov',
    '\\.cameraLockTarget\\(': '.lock(',
    '\\.cancelCameraLockTarget\\(': '.unlock(',
    '\\.switchCameraMode\\(': '.preset = (',
    '\\.cameraRelativeTransform =': '.localTransform =',
    '\\.cameraSystemRelativeTransform =': '.springArm.localTransform =',
    '\\.cameraWorldTransform =': '.worldTransform =',
    '\\.cameraRelativeTransform=': '.localTransform =',
    '\\.cameraSystemRelativeTransform=': '.springArm.localTransform =',
    '\\.cameraWorldTransform=': '.worldTransform =',
    '\\.cameraRelativeTransform\\b': '.localTransform.clone()',
    '\\.cameraSystemRelativeTransform\\b': '.springArm.localTransform.clone()',
    '\\.cameraWorldTransform\\b': '.worldTransform.clone()',
    '\\.cameraRotationLagEnable\\b': '.rotationLagEnabled',
    '\\.cameraRotationLagSpeed\\b': '.rotationLagSpeed',
    '\\.cameraSystemWorldTransform\\b': '.springArm.worldTransform',
    '\\.cameraRotationMode\\b': '.rotationMode',
    '\\.cameraUpLimitAngle\\b': '.upAngleLimit',
    '\\.currentCameraMode\\b': '.preset',
    '\\.fixedCameraZAxis\\b': '.fixedElevation',
    '\\.slotOffset\\b': '.localTransform.position',
    '\\.targetOffset\\b': '.springArm.localTransform.position',
    '\\.targetArmLength\\b': '.springArm.length',
    '\\.usePawnControlRotation\\b': '.springArm.useControllerRotation',
    '\\.setCameraLockTarget\\(': '.lock(',


    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.cancelCameraFollowTarget\\(": "ModifiedCameraSystem.cancelCameraFollowTarget(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.cancelCameraFollowTarget\\(": "ModifiedCameraSystem.cancelCameraFollowTarget(",
    "(\\w+)\\.(\\w+)\\.cancelCameraFollowTarget\\(": "ModifiedCameraSystem.cancelCameraFollowTarget(",
    "(\\w+)\\.cancelCameraFollowTarget\\(": "ModifiedCameraSystem.cancelCameraFollowTarget(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.setCameraFollowTarget\\(": "ModifiedCameraSystem.setCameraFollowTarget(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.setCameraFollowTarget\\(": "ModifiedCameraSystem.setCameraFollowTarget(",
    "(\\w+)\\.(\\w+)\\.setCameraFollowTarget\\(": "ModifiedCameraSystem.setCameraFollowTarget(",
    "(\\w+)\\.setCameraFollowTarget\\(": "ModifiedCameraSystem.setCameraFollowTarget(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.followTargetEnable\\b": "ModifiedCameraSystem.followTargetEnable",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.followTargetEnable\\b": "ModifiedCameraSystem.followTargetEnable",
    "(\\w+)\\.(\\w+)\\.followTargetEnable\\b": "ModifiedCameraSystem.followTargetEnable",
    "(\\w+)\\.followTargetEnable\\b": "ModifiedCameraSystem.followTargetEnable",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.followTargetInterpSpeed\\b": "ModifiedCameraSystem.followTargetInterpSpeed",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.followTargetInterpSpeed\\b": "ModifiedCameraSystem.followTargetInterpSpeed",
    "(\\w+)\\.(\\w+)\\.followTargetInterpSpeed\\b": "ModifiedCameraSystem.followTargetInterpSpeed",
    "(\\w+)\\.followTargetInterpSpeed\\b": "ModifiedCameraSystem.followTargetInterpSpeed",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.getCurrentSettings\\(": "ModifiedCameraSystem.getCurrentSettings(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.getCurrentSettings\\(": "ModifiedCameraSystem.getCurrentSettings(",
    "(\\w+)\\.(\\w+)\\.getCurrentSettings\\(": "ModifiedCameraSystem.getCurrentSettings(",
    "(\\w+)\\.getCurrentSettings\\(": "ModifiedCameraSystem.getCurrentSettings(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.getDefaultCameraShakeData\\(": "ModifiedCameraSystem.getDefaultCameraShakeData(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.getDefaultCameraShakeData\\(": "ModifiedCameraSystem.getDefaultCameraShakeData(",
    "(\\w+)\\.(\\w+)\\.getDefaultCameraShakeData\\(": "ModifiedCameraSystem.getDefaultCameraShakeData(",
    "(\\w+)\\.getDefaultCameraShakeData\\(": "ModifiedCameraSystem.getDefaultCameraShakeData(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.resetOverrideCameraRotation\\(": "ModifiedCameraSystem.resetOverrideCameraRotation(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.resetOverrideCameraRotation\\(": "ModifiedCameraSystem.resetOverrideCameraRotation(",
    "(\\w+)\\.(\\w+)\\.resetOverrideCameraRotation\\(": "ModifiedCameraSystem.resetOverrideCameraRotation(",
    "(\\w+)\\.resetOverrideCameraRotation\\(": "ModifiedCameraSystem.resetOverrideCameraRotation(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.setOverrideCameraRotation\\(": "ModifiedCameraSystem.setOverrideCameraRotation(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.setOverrideCameraRotation\\(": "ModifiedCameraSystem.setOverrideCameraRotation(",
    "(\\w+)\\.(\\w+)\\.setOverrideCameraRotation\\(": "ModifiedCameraSystem.setOverrideCameraRotation(",
    "(\\w+)\\.setOverrideCameraRotation\\(": "ModifiedCameraSystem.setOverrideCameraRotation(",


    "mw\\.CameraShake\\b": "Camera", //#dhy
    ":\\s+CameraShake\\b": ": Camera", //#dhy
    "mw\\.CameraSystem\\b": "Camera", //#dhy
    ":\\s+CameraSystem\\b": ": Camera", //#dhy
    "mw\\.CameraSystemData\\b": "CameraSystemData",//#dhy

    //Camera end

    //Animation start

    '\\.onAnimFinished\\b': '.onFinish',

    //Animation end

    //BlockingVolume start

    "\\.getCurrentPlayerPassable\\(": ".getTargetPassable(",
    "\\.setCurrentPlayerPassable\\(": ".addPassableTarget(",
    "\\.setNonCharacterActorCanPass\\(": ".addPassableTarget(",

    //BlockingVolume end

    //Character start

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill1Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill1Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.onSkill1Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+).onSkill1Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill2Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill2Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.onSkill2Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+).onSkill2Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill3Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill3Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.onSkill3Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+).onSkill3Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill4Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill4Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.onSkill4Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+).onSkill4Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill5Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.onSkill5Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+)\\.(\\w+)\\.onSkill5Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",
    "(\\w+).onSkill5Triggered.add\\(": "InputUtil.onKeyDown(Keys.One, ",

    //Character end

    //CharacterBase start

    "\\.setNonCharacterActorCanPass\\b": ".addMovement",
    "\\.airControl\\b": ".driftControl",
    "\\.basicStanceAimOffsetEnable\\b": ".currentStance.aimOffsetEnabled",
    "\\.brakingDecelerationFalling\\b": ".horizontalBrakingDecelerationFalling",
    "\\.canStepUpOn\\b": ".canStandOn",
    "\\.characterName\\b": ".displayName",
    "\\.collisionWithOtherCharacterEnable\\b": ".collisionWithOtherCharacterEnabled",
    "\\.crouchEnable\\b": ".crouchEnabled",
    "\\.headUIVisible\\b": ".nameVisible",
    "\\.headUIVisibleRange\\b": ".nameDisplayDistance",
    "\\.isPlayingAnimation\\b": ".currentAnimation?.isPlaying",
    "\\.jumpEnable\\b": ".jumpEnabled",
    "\\.jumpingOutOfWaterEnable\\b": ".canJumpOutOfWater",
    "\\.moveEnable\\b": ".movementEnabled",
    "\\.movementState\\b": ".movementMode",
    "\\.outOfWaterZ\\b": ".outOfWaterVerticalSpeed",
    "\\.ragdollEnable\\b": ".ragdollEnabled",
    "\\.usedCapsuleCorrection\\b": ".capsuleCorrectionEnabled",

    "\\.attach\\(": ".attachToSlot(",
    "\\.clearAppearance\\(": ".clearDescription(",
    "\\.getControlRotator\\(": ".getControllerRotation(",
    "\\.setLocallyVisibility\\(": ".setVisibility(",
    "\\.addMoveInput\\(": ".addMovement(",
    "\\.detachFromGameObject\\(\\)": ".parent = null",
    "\\.getHeadUIWidget\\(\\)": ".overheadUI",

    "\\.locallyVisible\\s*=[^=]\\s*([^;\n]*)": ".setVisibility($1)",
    "\\.locallyVisible\\b": ".getVisibility()",

    //  Animation
    // animationStance 替换
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion(($1).$2.$3, $4)',  // 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion(($1).$2, $3)',// 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion($1, $2)',// 有括号的情况 
    '(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion($1.$2.$3.$4,$5)',
    '(\\w+)\\.(\\w+)\\.(\\w+)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion($1.$2.$3,$4)',
    '(\\w+)\\.(\\w+)\\(\\)\\.(\\w+)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion($1.$2().$3,$4)',
    '(\\w+)\\.(\\w+)\\.animationStance\\s*=\\s(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion($1.$2,$3)',
    '(\\w+)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion($1,$2)',
    '(\\w+)\\.animationStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeStanceExtesion($1,$2)',
    // basicStance 替换
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion(($1).$2.$3, $4)',  // 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion(($1).$2, $3)',// 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion($1, $2)',// 有括号的情况 
    '(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion($1.$2.$3.$4,$5)',
    '(\\w+)\\.(\\w+)\\.(\\w+)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion($1.$2.$3,$4)',
    '(\\w+)\\.(\\w+)\\(\\)\\.(\\w+)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion($1.$2().$3,$4)',
    '(\\w+)\\.(\\w+)\\.basicStance\\s*=\\s(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion($1.$2,$3)',
    '(\\w+)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion($1,$2)',
    '(\\w+)\\.basicStance\\s*=\\s*(.*?)[\\r\\n|;]': 'PlayerManagerExtesion.changeBaseStanceExtesion($1,$2)',
    // playAnimation 替换
    'mw\\.getPlayer\\((.*?)\\)\\.character\\.playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation(mw.getPlayer($1).character, $2)',// 20231011dhy修改
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation(($1).$2.$3, $4)',  // 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation(($1).$2, $3)',// 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation($1, $2)',// 有括号的情况 
    '=\\s*(\\w+)\\.(.*?)\\.playAnimation\\((.*?)\\);?': '= PlayerManagerExtesion.rpcPlayAnimation($1.$2, $3)',
    '=\\s*(\\w+)\\.playAnimation\\((.*?)\\);?': '= PlayerManagerExtesion.rpcPlayAnimation($1, $2)',
    '(\\w+)\\.(\\w+)\\.(\\w+).playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation($1.$2.$3, $4)',// 20231011dhy修改
    '(\\w+)\\.(\\w+).playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation($1.$2, $3)',
    '(\\w+)\\.(.*?)\\.playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation($1.$2, $3)',
    '(\\w+(?<!this))\\.playAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimation($1, $2)',
    // playAnimationLocally 替换
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.playAnimationLocally\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimationLocally(($1).$2.$3, $4)',  // 有括号的情况
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.playAnimationLocally\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimationLocally(($1).$2, $3)',// 有括号的情况
    '(?<!if)\\((.*?)\\)\\.playAnimationLocally\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimationLocally($1, $2)',// 有括号的情况 
    '(\\w+)\\.(.*?)\\.playAnimationLocally\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimationLocally($1.$2, $3)',
    '(\\w+(?<!this))\\.playAnimationLocally\\((.*?)\\);?': 'PlayerManagerExtesion.rpcPlayAnimationLocally($1, $2)',
    // loadAnimation 替换
    'mw\\.getPlayer\\((.*?)\\)\\.character\\.loadAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.loadAnimationExtesion(mw.getPlayer($1).character, $2)',// 20231011dhy修改
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.loadAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.loadAnimationExtesion(($1).$2.$3, $4)',  // 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.loadAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.loadAnimationExtesion(($1).$2, $3)',// 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.loadAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.loadAnimationExtesion($1, $2)',// 有括号的情况 
    '=\\s*(\\w+)\\.(.*?)\\.loadAnimation\\((.*?)\\);?': '= PlayerManagerExtesion.loadAnimationExtesion($1.$2, $3)',
    '=\\s*(\\w+)\\.loadAnimation\\((.*?)\\);?': '= PlayerManagerExtesion.loadAnimationExtesion($1, $2)',
    '(\\w+)\\.(\\w+)\\.(\\w+).loadAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.loadAnimationExtesion($1.$2.$3, $4)', // 20231011dhy修改
    '(\\w+)\\.(.*?)\\.loadAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.loadAnimationExtesion($1.$2, $3)',
    '(\\w+(?<!this))\\.loadAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.loadAnimationExtesion($1, $2)',
    // loadStance 替换
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.loadStance\\((.*?)\\);?': 'PlayerManagerExtesion.loadStanceExtesion(($1).$2.$3, $4)',  // 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.loadStance\\((.*?)\\);?': 'PlayerManagerExtesion.loadStanceExtesion(($1).$2, $3)',// 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.loadStance\\((.*?)\\);?': 'PlayerManagerExtesion.loadStanceExtesion($1, $2)',// 有括号的情况 
    '=\\s*(\\w+)\\.(.*?)\\.loadStance\\((.*?)\\);?': '= PlayerManagerExtesion.loadStanceExtesion($1.$2, $3)',
    '=\\s*(\\w+)\\.loadStance\\((.*?)\\);?': '= PlayerManagerExtesion.loadStanceExtesion($1, $2)',
    '(\\w+)\\.(.*?)\\.loadStance\\((.*?)\\);?': 'PlayerManagerExtesion.loadStanceExtesion($1.$2, $3)',
    '(\\w+(?<!this))\\.loadStance\\((.*?)\\);?': 'PlayerManagerExtesion.loadStanceExtesion($1, $2)',
    // stopAnimation 替换
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.stopAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcStopAnimation(($1).$2.$3, $4)',  // 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.stopAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcStopAnimation(($1).$2, $3)',// 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.stopAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcStopAnimation($1, $2)',// 有括号的情况 
    '=\\s*(\\w+)\\.(.*?)\\.stopAnimation\\((.*?)\\);?': '= PlayerManagerExtesion.rpcStopAnimation($1.$2, $3)',
    '=\\s*(\\w+)\\.stopAnimation\\((.*?)\\);?': '= PlayerManagerExtesion.rpcStopAnimation($1, $2)',
    '(\\w+)\\.(.*?)\\.stopAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcStopAnimation($1.$2, $3)',
    '(\\w+(?<!this))\\.stopAnimation\\((.*?)\\);?': 'PlayerManagerExtesion.rpcStopAnimation($1, $2)',
    // stopStance 替换
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.(\\w+)\\.stopStance\\((.*?)\\);?': 'PlayerManagerExtesion.stopStanceExtesion(($1).$2.$3, $4)',  // 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.(\\w+)\\.stopStance\\((.*?)\\);?': 'PlayerManagerExtesion.stopStanceExtesion(($1).$2, $3)',// 有括号的情况 
    '(?<!if)\\((.*?)\\)\\.stopStance\\((.*?)\\);?': 'PlayerManagerExtesion.stopStanceExtesion($1, $2)',// 有括号的情况 
    '=\\s*(\\w+)\\.(.*?)\\.stopStance\\((.*?)\\);?': '= PlayerManagerExtesion.stopStanceExtesion($1.$2, $3)',
    '=\\s*(\\w+)\\.stopStance\\((.*?)\\);?': '= PlayerManagerExtesion.stopStanceExtesion($1, $2)',
    '(\\w+)\\.(.*?)\\.stopStance\\((.*?)\\);?': 'PlayerManagerExtesion.stopStanceExtesion($1.$2, $3)',
    '(\\w+(?<!this))\\.stopStance\\((.*?)\\);?': 'PlayerManagerExtesion.stopStanceExtesion($1, $2)',


    "mw.Stance\\b": "mw.SubStance",

    //Event start

    "mw\\.addClientListener\\(": "Event.addClientListener(",
    "mw\\.addExitListener\\(": "SystemUtil.onExit.add(",
    "mw\\.addFocusListener\\(": "WindowUtil.onFocus.add(",
    "mw\\.addLocalListener\\(": "Event.addLocalListener(",
    "mw\\.addOnPauseListener\\(": "SystemUtil.onPause.add(",
    "mw\\.addOnResumeListener\\(": "SystemUtil.onResume.add(",
    "mw\\.addPlayerJoinedListener\\(": "Player.onPlayerJoin.add(",
    "mw\\.addPlayerLeftListener\\(": "Player.onPlayerLeave.add(",
    "mw\\.addServerListener\\(": "Event.addServerListener(",
    "mw\\.addUnfocusedListener\\(": "WindowUtil.onDefocus.add(",
    "mw\\.dispatchLocal\\(": "Event.dispatchToLocal(",
    "mw\\.dispatchToAllClient\\(": "Event.dispatchToAllClient(",
    "mw\\.dispatchToClient\\(": "Event.dispatchToClient(",
    "mw\\.dispatchToServer\\(": "Event.dispatchToServer(",

    //Event end

    //GameObject start
    "\\.addDestroyCallback\\(": ".onDestroyDelegate.add(",
    "mw\\.GameObject\\.asyncFind\\(": "GameObject.asyncFindGameObjectById(",
    "GameObject\\.asyncFind\\(": "GameObject.asyncFindGameObjectById(",
    "\\.asyncGetScriptByName\\(": ".getScriptByName(",
    "\\.attachToGameObject\\((.*?)": ".parent = ($1",
    "\\.deleteDestroyCallback\\(": ".onDestroyDelegate.remove(",
    "\\.detachFromGameObject\\(\\)": ".parent = null",
    "mw\\.GameObject\\.find\\(": "GameObject.findGameObjectById(",
    "GameObject.find\\(": "GameObject.findGameObjectById(",
    "GameObject\\.findGameObjectByTag\\(": "GameObject.findGameObjectsByTag(",
    "\\.forwardVector": ".worldTransform.getForwardVector()",
    "\\.getBoundingBoxSize\\(\\)": ".getBoundingBoxExtent()",
    "\\.getChildByGuid\\(": ".getChildByGameObjectId(",
    "\\.getChildrenBoxCenter\\(": ".getChildrenBoundingBoxCenter(",
    "mw\\.GameObject\\.getGameObjectByName\\(": "GameObject.findGameObjectByName(",
    "GameObject\\.getGameObjectByName\\(": "GameObject.findGameObjectByName(",
    "mw\\.GameObject\\.getGameObjectsByName\\(": "GameObject.findGameObjectsByName(",
    "GameObject\\.getGameObjectsByName\\(": "GameObject.findGameObjectsByName(",
    "\\.getRelativeLocation\\(\\)": ".localTransform.position",
    "\\.getRelativeRotation\\(\\)": ".localTransform.rotation",
    "\\.getRelativeScale\\(\\)": ".localTransform.scale",
    "\\.getScriptByGuid\\(": ".getScript(",
    "\\.getTransform\\(\\)": ".worldTransform.clone()",
    "\\.getUpVector\\(": ".worldTransform.getUpVector(",
    "\\.getWorldLocation\\(\\)": ".worldTransform.position",
    "\\.getWorldRotation\\(\\)": ".worldTransform.rotation",
    "\\.getWorldScale\\(\\)": ".worldTransform.scale",
    "\\.ready\\(": ".asyncReady(",
    "\\.relativeLocation": ".localTransform.position",
    "\\.relativeRotation": ".localTransform.rotation",
    "\\.relativeScale": ".localTransform.scale",
    "\\.rightVector": ".worldTransform.getRightVector()",
    "\\.setRelativeLocation\\(": ".localTransform.position = (",
    "\\.setRelativeRotation\\(": ".localTransform.rotation = (",
    "\\.setRelativeScale\\(": ".localTransform.scale = (",
    "\\.setTransform\\(": ".worldTransform = (",
    "\\.setWorldLocation\\(": ".worldTransform.position = (",
    "\\.setWorldRotation\\(": ".worldTransform.rotation = (",
    "\\.setWorldScale\\(": ".worldTransform.scale = (",
    "\\.upVector": ".worldTransform.getUpVector()",
    "\\.worldLocation": ".worldTransform.position",
    "\\.worldRotation": ".worldTransform.rotation",
    "\\.worldScale": ".worldTransform.scale",

    //GameObject end

    //交互物 start

    "\\.endInteract\\(": ".leave(",

    '=\\s*(\\w+)\\.(.*?)\\.enterInteractiveState\\((.*?)\\);?\\.then': "= GeneralManager.modiftEnterInteractiveState($1.$2, $3).then",
    '=\\s*(\\w+)\\.enterInteractiveState\\((.*?)\\);?\\.then': "= GeneralManager.modiftEnterInteractiveState($1, $2).then",
    '(\\w+)\\.(.*?)\\.enterInteractiveState\\((.*?)\\);?\\.then': "GeneralManager.modiftEnterInteractiveState($1.$2, $3).then",
    '(\\w+)\\.enterInteractiveState\\((.*?)\\);?\\.then': "GeneralManager.modiftEnterInteractiveState($1, $2).then",

    "\\.enterInteractiveState\\(": ".enter(",

    '=\\s*(\\w+)\\.(.*?)\\.exitInteractiveState\\((.*?)\\);?': '= GeneralManager.modifyExitInteractiveState($1.$2, $3)',
    '=\\s*(\\w+)\\.exitInteractiveState\\((.*?)\\);?': '= GeneralManager.modifyExitInteractiveState($1, $2)',
    '(\\w+)\\.(.*?)\\.exitInteractiveState\\((.*?)\\);?': 'GeneralManager.modifyExitInteractiveState($1.$2, $3)',
    '(\\w+)\\.exitInteractiveState\\((.*?)\\);?': 'GeneralManager.modifyExitInteractiveState($1, $2)',

    "\\.getInteractCharacter\\(\\)": ".getCurrentCharacter()",
    "\\.getInteractiveState\\(\\)": ".occupied",
    "\\.interactiveCharacter\\(\\)": ".getCurrentCharacter()",
    "\\.interactiveSlot\\b": ".slot",
    "\\.interactiveStance\\b": ".animationId",
    "\\.onInteractiveEnded\\b": ".onLeave",
    "\\.onInteractiveStarted\\b": ".onEnter",
    "\\.onInteractorEnter\\b": ".onEnter",
    "\\.onInteractorExit\\b": ".onLeave",
    "\\.startInteract\\(": ".enter(",

    //交互物 end

    //EffectService start

    'EffectService\\.stopEffect\\(': 'EffectService.stop(',
    'EffectService\\.getEffectGameObject\\(': 'EffectService.getEffectById(',
    'EffectService\\.stopAllEffect\\(': 'EffectService.stopAll(',
    'EffectService\\.playEffectOnPlayer\\(': 'GeneralManager.rpcPlayEffectOnPlayer(',
    'EffectService\\.playEffectOnGameObject\\(': 'GeneralManager.rpcPlayEffectOnGameObject(',
    'EffectService\\.playEffectAtLocation\\(': 'GeneralManager.rpcPlayEffectAtLocation(',
    'EffectService\\.playEffectAtLocation\\(': 'GeneralManager.rpcPlayEffectAtLocation(',
    'EffectManager\\.stopEffect\\(': 'EffectService.stop(',
    'EffectManager\\.getEffectGameObject\\(': 'EffectService.getEffectById(',
    'EffectManager\\.stopAllEffect\\(': 'EffectService.stopAll(',
    'EffectManager\\.playEffectOnPlayer\\(': 'GeneralManager.rpcPlayEffectOnPlayer(',
    'EffectManager\\.playEffectOnGameObject\\(': 'GeneralManager.rpcPlayEffectOnGameObject(',
    'EffectManager\\.playEffectAtLocation\\(': 'GeneralManager.rpcPlayEffectAtLocation(',

    //EffectService end

    //Model start

    '\\.gravityEnable\\b': '.gravityEnabled',
    '\\.isSimulatingPhysics\\b': '.physicsEnabled',
    '\\.massEnable\\b': '.massEnabled',
    '\\.massInKg\\b': '.mass',
    '\\.setOutlineAndColor\\(': '.setOutline(',

    //Model end

    //player start

    '\\.customTimeDilation\\b': '.character.customTimeDilation',

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.addNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.add(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.addNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.add(",
    "(\\w+)\\.(\\w+)\\.addNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.add(",
    "(\\w+).addNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.add(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.addNetworkReconnectListener\\(": "Player.onPlayerReconnect.add(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.addNetworkReconnectListener\\(": "Player.onPlayerReconnect.add(",
    "(\\w+)\\.(\\w+)\\.addNetworkReconnectListener\\(": "Player.onPlayerReconnect.add(",
    "(\\w+).addNetworkReconnectListener\\(": "Player.onPlayerReconnect.add(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.removeNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.remove(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.removeNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.remove(",
    "(\\w+)\\.(\\w+)\\.removeNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.remove(",
    "(\\w+).removeNetworkDisconnectListener\\(": "Player.onPlayerDisconnect.remove(",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\.removeNetworkReconnectListener\\(": "Player.onPlayerReconnect.remove(",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\.removeNetworkReconnectListener\\(": "Player.onPlayerReconnect.remove(",
    "(\\w+)\\.(\\w+)\\.removeNetworkReconnectListener\\(": "Player.onPlayerReconnect.remove(",
    "(\\w+).removeNetworkReconnectListener\\(": "Player.onPlayerReconnect.remove(",

    '\\.getPlayerID\\(\\)': '.playerId',
    '\\.getTeamId\\(\\)': '.teamId',
    '\\.getPlayerID\\(\\)': '.playerId',
    '\\.getPlayerID\\(\\)': '.playerId',
    '\\.getUserId\\(\\)': '.userId',
    '\\bAccountService\\.userId\\b': 'AccountService.getUserId()',

    //player end

    //Sound start

    '\\.onSoundFinished\\b': '.onFinish',
    '\\.onSoundPaused\\b': '.onPause',
    '\\.onSoundStarted\\b': '.onPlay',
    '\\.outerRadius\\b': '.falloffDistance',
    '\\.shapeExtents\\b': '.attenuationShapeExtents',
    '\\.soundDistance\\b': '.falloffDistance',
    '\\.spatialization\\b': '.isSpatialization',
    '\\.uiSound\\b': '.isUISound',
    '\\.volumeMultiplier\\b': '.volume',

    //Sound end

    //Transform start

    '\\.inverseTransformLocation\\(': '.inverseTransformPosition(',
    '\\.transformLocation\\(': '.transformPosition(',

    //Transform end

    //Trigger start

    '\\.isBoxShape\\(\\)': '.shape == TriggerShapeType.Box',
    '\\.isSphereShape\\(\\)': '.shape == TriggerShapeType.Sphere',
    '\\.isInArea\\(': '.checkInArea(',
    '\\.setCollisionEnabled\\(': '.enabled = (',

    //Trigger end

    //属性修改 start

    "\\.AudioPlayState\\b": ".SoundPlayState",

    'instanceof\\s+mw\\.CharacterBase\\b': 'instanceof mw.Pawn',

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.Character\\b": "PlayerManagerExtesion.isCharacter($1.$2.$3.$4)",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.Character\\b": "PlayerManagerExtesion.isCharacter($1.$2.$3)",
    "(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.Character\\b": "PlayerManagerExtesion.isCharacter($1.$2)",
    "(\\w+)\\s+instanceof\\s+mw\\.Character\\b": "PlayerManagerExtesion.isCharacter($1)",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.NPC\\b": "PlayerManagerExtesion.isNpc($1.$2.$3.$4)",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.NPC\\b": "PlayerManagerExtesion.isNpc($1.$2.$3)",
    "(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.NPC\\b": "PlayerManagerExtesion.isNpc($1.$2)",
    "(\\w+)\\s+instanceof\\s+mw\\.NPC\\b": "PlayerManagerExtesion.isNpc($1)",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.Humanoid\\b": "PlayerManagerExtesion.isNpc($1.$2.$3.$4)",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.Humanoid\\b": "PlayerManagerExtesion.isNpc($1.$2.$3)",
    "(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.Humanoid\\b": "PlayerManagerExtesion.isNpc($1.$2)",
    "(\\w+)\\s+instanceof\\s+mw\\.Humanoid\\b": "PlayerManagerExtesion.isNpc($1)",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.HumanoidV2\\b": "PlayerManagerExtesion.isNpc($1.$2.$3.$4)",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.HumanoidV2\\b": "PlayerManagerExtesion.isNpc($1.$2.$3)",
    "(\\w+)\\.(\\w+)\\s+instanceof\\s+mw\\.HumanoidV2\\b": "PlayerManagerExtesion.isNpc($1.$2)",
    "(\\w+)\\s+instanceof\\s+mw\\.HumanoidV2\\b": "PlayerManagerExtesion.isNpc($1)",

    "(\\w+)\\.(\\w+)\\.(\\w+)\\.(\\w+)\\\s+instanceof\\\s+mw.AICharacter\\b": "PlayerManagerExtesion.isNpc($1.$2.$3.$4)",
    "(\\w+)\\.(\\w+)\\.(\\w+)\\\s+instanceof\\\s+mw.AICharacter\\b": "PlayerManagerExtesion.isNpc($1.$2.$3)",
    "(\\w+)\\.(\\w+)\\\s+instanceof\\\s+mw.AICharacter\\b": "PlayerManagerExtesion.isNpc($1.$2)",
    "(\\w+)\\\s+instanceof\\\s+mw.AICharacter\\b": "PlayerManagerExtesion.isNpc($1)",

    "mw.NPC\\b": "mw.Character",

    "mw.Humanoid\\b": "mw.Character",

    "mw.CharacterBase\\b": "mw.Character",

    "mw.SomatotypeFourFootStandard\\b": "mw.FourFootStandard",

    "mw.AICharacter\\b": "mw.Character",

    "mw.CameraMode\\b": "mw.CameraPreset",

    "mw.HumanoidObject_V2\\b": "mw\\.Character",

    "mw.HumanoidObject\\b": "mw.Character",

    ".getAppearance\\(\\).getSomatotype\\(\\)": ".description.advance.base.characterSetting.somatotype",

    ".loadSlotAndEditorDataByGuid\(([^)]+)\)": ".description.base.wholeBody = $1",

    ".locallyVisible\\\s*=\\\s*(\\w+)": ".setVisibility($1 ? Type.PropertyStatus.On : Type.PropertyStatus.Off)",

    '\\bMesh\\b': 'Model',


    //禁行区
    ".BlockingArea\\\b": ".BlockingVolume",

    //补充
    'DataStorage.asyncSetCustomData\\(': 'DataStorage.asyncSetData(',
    '.particleLength\\\b': '.timeLength',
    '\\.getSourceAssetGuid\\(\\)': '.assetId',
    '\\.setAudioAssetByGuid\\(': '.setSoundAsset('


}
// 需要替换的字符串  key:旧api   value：新api

apiReplaceStr = {
    'mw.Particle': 'mw.Effect',

    //Spawn start

    'GameObjPool.spawn(': 'SpawnManager.modifyPoolSpawn(',
    'GameObjPool.asyncSpawn(': 'SpawnManager.modifyPoolAsyncSpawn(',
    'GameObjPool.spawn<': 'SpawnManager.modifyPoolSpawn<',
    'GameObjPool.asyncSpawn<': 'SpawnManager.modifyPoolAsyncSpawn<',
    'mw.GameObject.spawnGameObject(': "SpawnManager.wornSpawn(",
    'mw.AdvancedVehicle.spawnGameObject(': "SpawnManager.wornSpawn<mw.AdvancedVehicle>(",
    'mw.Effect.spawnGameObject(': "SpawnManager.wornSpawn<mw.Effect>(",
    'mw.Sound.spawnGameObject(': "SpawnManager.wornSpawn<mw.Sound>(",
    'mw.Trigger.spawnGameObject(': "SpawnManager.wornSpawn<mw.Trigger>(",
    'mw.UIWidget.spawnGameObject(': "SpawnManager.wornSpawn<mw.UIWidget>(",
    'mw.Interactor.spawnGameObject(': "SpawnManager.wornSpawn<mw.Interactor>(",
    'mw.IntegratedMover.spawnGameObject(': "SpawnManager.wornSpawn<mw.IntegratedMover>(",

    'mw.GameObject.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn(",
    'mw.AdvancedVehicle.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn<mw.AdvancedVehicle>(",
    'mw.Effect.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn<mw.Effect>(",
    'mw.Sound.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn<mw.Sound>(",
    'mw.Trigger.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn<mw.Trigger>(",
    'mw.UIWidget.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn<mw.UIWidget>(",
    'mw.Interactor.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn<mw.Interactor>(",
    'mw.IntegratedMover.asyncSpawnGameObject(': "SpawnManager.wornAsyncSpawn<mw.IntegratedMover>(",

    'mw.GameObject.spawn(': "SpawnManager.spawn(",
    'GameObject.spawn(': "SpawnManager.spawn(",
    'mw.AdvancedVehicle.spawn(': "SpawnManager.spawn<mw.AdvancedVehicle>(",
    'mw.Effect.spawn(': "SpawnManager.spawn<mw.Effect>(",
    'mw.Sound.spawn(': "SpawnManager.spawn<mw.Sound>(",
    'mw.Trigger.spawn(': "SpawnManager.spawn<mw.Trigger>(",
    'mw.UIWidget.spawn(': "SpawnManager.spawn<mw.UIWidget>(",
    'mw.Interactor.spawn(': "SpawnManager.spawn<mw.Interactor>(",
    'mw.IntegratedMover.spawn(': "SpawnManager.spawn<mw.IntegratedMover>(",
    'mw.GameObject.spawn<': 'SpawnManager.spawn<',
    'GameObject.spawn<': 'SpawnManager.spawn<',

    'mw.GameObject.asyncSpawn(': "SpawnManager.asyncSpawn(",
    'mw.AdvancedVehicle.asyncSpawn(': "SpawnManager.asyncSpawn<mw.AdvancedVehicle>(",
    'mw.Effect.asyncSpawn(': "SpawnManager.asyncSpawn<mw.Effect>(",
    'mw.Sound.asyncSpawn(': "SpawnManager.asyncSpawn<mw.Sound>(",
    'mw.Trigger.asyncSpawn(': "SpawnManager.asyncSpawn<mw.Trigger>(",
    'mw.UIWidget.asyncSpawn(': "SpawnManager.asyncSpawn<mw.UIWidget>(",
    'mw.Interactor.asyncSpawn(': "SpawnManager.asyncSpawn<mw.Interactor>(",
    'mw.IntegratedMover.asyncSpawn(': "SpawnManager.asyncSpawn<mw.IntegratedMover>(",
    'mw.GameObject.asyncSpawn<': 'SpawnManager.asyncSpawn<',

    //Spawn end

    //Gameplaystatic start

    'mw.addOutlineEffect(': 'GeneralManager.modifyaddOutlineEffect(',
    'mw.angleCheck(': 'MathUtil.angleCheck(',
    'mw.asyncFindPathToLocation(': 'Navigation.findPath(',
    'mw.asyncGetCurrentPlayer(': 'Player.asyncGetLocalPlayer(',
    'mw.boxOverlap(': 'GeneralManager.modiftboxOverlap(',
    'mw.boxOverlapInLevel(': 'GeneralManager.modifyboxOverlapInLevel(',
    'mw.clearFollow(': 'Navigation.stopFollow(',
    'mw.clearMoveTo(': 'Navigation.stopNavigateTo(',
    'mw.cylinderOverlap(': 'QueryUtil.capsuleOverlap(',
    'mw.follow(': 'Navigation.follow(',
    'mw.getClickGameObjectByScene(': 'ScreenUtil.getGameObjectByScreenPosition(',
    'mw.getCurrentPlayer()': 'Player.localPlayer',
    'mw.getGameObjectByScenePosition(': 'ScreenUtil.getGameObjectByScreenPosition(',
    'mw.getPlayer(': 'Player.getPlayer(',
    'mw.getShootDir(': 'GeneralManager.modifyGetShootDir(',
    'mw.getSightBeadLocation(': 'ScreenUtil.getSightBeadPosition(',
    'mw.lineTrace(': 'QueryUtil.lineTrace(',
    'mw.moveTo(': 'Navigation.navigateTo(',
    'mw.setGlobalAsyncTimeout(': 'ScriptingSettings.setGlobalAsyncTimeout(',
    'mw.setGlobalTimeDilation(': 'EnvironmentSettings.setGlobalTimeDilation(',
    'mw.sphereOverlap(': 'QueryUtil.sphereOverlap(',
    'mw.getAllPlayers()': 'Player.getAllPlayers()',
    'InputUtil.projectWorldLocationToWidgetPosition(': 'InputUtil.projectWorldPositionToWidgetPosition(',
    'mw.projectWorldLocationToWidgetPosition': 'GeneralManager.modifyProjectWorldLocationToWidgetPosition',

    'DataStorage.asyncGetData(': 'GeneralManager.asyncRpcGetData(',
    'DataStorage.asyncGetCustomData(': 'GeneralManager.asyncRpcGetData(',
    'DataStorage.asyncRemoveCustomData(': 'DataStorage.asyncRemoveData(',
    'mw.AdsService.show(': 'GeneralManager.modifyShowAd(',
    'AdsService.show(': 'GeneralManager.modifyShowAd(',

    //Gameplaystatic end

    //UI start

    'mw.UIBehavior': 'mw.UIScript',
    'findUIBehavior': 'findUIScript',
    '.setUIbyGUID(': '.setUIbyID(',

    //UI end

    //Tween start

    'mw.TweenUtil.Tween': 'mw.Tween',
    'TweenUtil.Tween': 'mw.Tween',
    'TweenUtil.Group': 'TweenGroup',

    //Tween end

    'mw.CameraLocationMode': 'mw.CameraPositionMode',
    'CameraPositionMode.LocationFixed': 'CameraPositionMode.PositionFixed',
    'CameraPositionMode.LocationFollow': 'CameraPositionMode.PositionFollow',

    //GraphicsSettings start

    'SystemUtil.getGraphicsCPULevel()': 'GraphicsSettings.getCPULevel()',
    'SystemUtil.getGraphicsGPULevel()': 'GraphicsSettings.getGPULevel()',
    'SystemUtil.getDefaultGraphicsCPULevel()': 'GraphicsSettings.getDefaultCPULevel()',
    'SystemUtil.getDefaultGraphicsGPULevel()': 'GraphicsSettings.getDefaultGPULevel()',
    'SystemUtil.setGraphicsCPULevel(': 'GraphicsSettings.setGraphicsCPULevel(',
    'SystemUtil.setGraphicsGPULevel(': 'GraphicsSettings.setGraphicsGPULevel(',
    'Settings.GraphicsSettings': 'GraphicsSettings',

    //GraphicsSettings end
    ':SlotType': ':mw.HumanoidSlotType',
    ': SlotType': ':mw.HumanoidSlotType',
    ':  SlotType': ':mw.HumanoidSlotType',
    ':   SlotType': ':mw.HumanoidSlotType',
    'mw.SlotType': 'mw.HumanoidSlotType',
    'mw.InteractiveSlot': 'mw.HumanoidSlotType',
    'HumanoidSlotType.Buns': 'HumanoidSlotType.Buttocks',
    'mw.StaticMesh': 'mw.Model',
    'mw.Mesh': 'mw.Model',
    'mw.SpawnInfo': 'SpawnInfo',
    'DataCenterC.asyncReady()': 'DataCenterC.ready()',
    'ModuleService.asyncReady()': 'ModuleService.ready()',
    'DataStorage.DataStorageResultCode': 'mw.DataStorageResultCode',
    'Optimization.enableOptimization(': 'AvatarSettings.optimizationEnabled =(',
    'mwext.SpawnManager': 'SpawnManager',
    'mw.Oscillator': 'CameraModifid.Oscillator',
    'mw.EOscillatorWaveform': 'CameraModifid.EOscillatorWaveform',
    'AssetUtil.isAssetExist(': 'AssetUtil.assetLoaded(',
    ':ModuleManager': ':ModuleService',
    'mw.UIManager': 'mw.UIService',
    'SoundService.get3DSoundGameObject': 'SoundService.get3DSoundById',
    'mw.asyncGetPlayer(': 'Player.asyncGetPlayer(',

    'DataCenterS.onPlayerJoined': 'DataCenterS.onPlayerJoin',
    'DataCenterS.onPlayerLeft': 'DataCenterS.onPlayerLeave',
}

// 需要优先替换的字符串
apiReplaceStrFirst = {
    //注解替换 start
    '@Core.Class': '@Component',
    '@UI.UICallOnly(': '@UIBind(',
    '@UI.UIMarkPath(': '@UIWidgetBind(',
    '@Core.Type': '@Serializable',
    'Core.Type': 'Serializable',
    '@Core.Function': '@RemoteFunction',
    '@Decorator.saveProperty': '@Decorator.persistence()',
    '@Core.Property(': '@mw.Property(',
    //注解替换 end
}

scenefileNameList = []

apifileNameList = []

function deleteDir(dirPath) {
    if (fs.existsSync(dirPath)) {
        const dirList = fs.readdirSync(dirPath);

        for (let i = 0; i < dirList.length; i++) {
            const fullPath = path.join(dirPath, dirList[i]);

            if (fs.statSync(fullPath).isDirectory()) {
                deleteDir(fullPath);
            } else {
                fs.unlinkSync(fullPath);
            }
        }

        fs.rmdirSync(dirPath);
    }
}

const writeFileAsync = promisify(fs.writeFile);
const readFileAsync = promisify(fs.readFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);
const unlinkAsync = promisify(fs.unlink);
const rmdirAsync = promisify(fs.rmdir);

async function readFileAsyncaa(path) {
    let text = (fs.readFileSync(path));
    const encoding = detectEncoding(text);
    if (encoding !== 'utf8') {
        text = (await readFileAsync(path, encoding));
    } else {
        text = (await readFileAsync(path, 'utf8'));
    }
    text = text.replace(/^\uFEFF/, '');
    return text;
}

function detectEncoding(buffer) {
    if (buffer.length >= 2) {
        if (buffer[0] === 254 && buffer[1] === 255) {
            return "utf16be";
        } else if (buffer[0] === 255 && buffer[1] === 254) {
            return "utf16le";
        }
    }
    return "utf8";
}

var recordContent = '';

async function recordModifiedFile(filePath) {
    try {
        // await writeFileAsync(recordFile, filePath + '\n', { flag: 'a' });
        recordContent += filePath + '\n';
        console.log('文件路径已成功记录！');
    } catch (err) {
        console.error(err);
    }
}

async function isFileModified(filePath) {
    try {
        const lines = (await readFileAsyncaa(recordFile)).split('\n');
        return lines.includes(filePath);
    } catch (err) {
        console.error(err);
        return false;
    }
}

function file_name(fileDir) {
    const scenefileNameList = [];
    const apifileNameList = [];

    const walk = (dirPath) => {
        const dirList = fs.readdirSync(dirPath, { withFileTypes: true });

        for (const dirent of dirList) {
            const fileName = dirent.name;
            const fullPath = path.join(dirPath, fileName);
            if (dirPath.includes(apiTempTxt) || dirPath.includes(sceneTempTxt)) {
                console.log('当前文件不需要替换', fileName);
            } else {
                if (path.extname(fileName) === '.level' || path.extname(fileName) === '.asset' || path.extname(fileName) === '.prefab' || fileName === 'All_Json') {
                    console.error('当前文件夹需要遍历：', fileName);
                    scenefileNameList.push(fullPath);
                    if (fileName === 'NewLevel.level') {
                        const newFileName = '026NewLevel.level';
                        const newFilePath = path.join(dirPath, newFileName);
                        fs.copyFileSync(fullPath, newFilePath);
                        console.log('已复制文件:', newFileName);
                    }
                }
            }
            if (fileName === "UIScriptHeader_Template") {
                apifileNameList.push(fullPath);
            }
            if (path.extname(fileName) === '.ts') {
                if (dirPath.includes('Modified027Editor')) {
                    console.log('当前文件不需要替换', fileName);
                } else {
                    if (dirPath.includes('JavaScripts')) {
                        apifileNameList.push(fullPath);
                    }
                }
            }
        }

        for (const dirent of dirList) {
            const fullPath = path.join(dirPath, dirent.name);

            if (dirent.isDirectory()) {
                walk(fullPath);
            }
        }
    };
    console.log('开始遍历文件夹：', fileDir);
    walk(fileDir);

    return { scenefileNameList, apifileNameList };
}
function replaceAll(inputString, search, replacement) {
    // 将搜索字符串中的正则元字符进行转义
    const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // 创建一个正则表达式对象，使用全局匹配模式
    const regex = new RegExp(escapedSearch, 'g');
    // 使用 replace 方法替换所有匹配项
    return inputString.replace(regex, replacement);
}

// 正则替换
function replace(content, replaceStr) {
    for (const [k, v] of Object.entries(replaceStr)) {
        content = content.replace(new RegExp(k, 'g'), v);
    }
    return content;
}

// 普通替换
function replaceStr(content, replaceStr) {
    for (const [k, v] of Object.entries(replaceStr)) {
        content = replaceAll(content, k, v);
    }
    return content;
}

async function changeFile(fileName, tempTxt, isScene) {
    try {
        console.log('开始替换文件：', fileName);
        const content = await readFileAsyncaa(fileName);
        let modifiedContent;

        if (isScene) {
            modifiedContent = replaceStr(content, sceneFirstReplaceStr);
            modifiedContent = replace(modifiedContent, sceneRegexList);
            modifiedContent = replaceStr(modifiedContent, sceneReplaceStr);
        } else {
            modifiedContent = replaceStr(content, apiReplaceStrFirst);
            modifiedContent = replace(modifiedContent, apiRegexList);
            modifiedContent = replaceStr(modifiedContent, apiReplaceStr);
        }

        if (fileName !== path.join(tempTxt, path.basename(fileName))) {
            await fs.promises.copyFile(fileName, path.join(tempTxt, path.basename(fileName)));
        }

        await writeFileAsync(fileName, modifiedContent, 'utf8');
        await recordModifiedFile(fileName);
    } catch (err) {
        console.error(err);
    }
}

async function main() {
    try {
        if (fs.existsSync(recordFile)) {
            return;
        }
    } catch (error) {
        console.error(error);
    }
    const { scenefileNameList, apifileNameList } = file_name(process.cwd());

    try {
        if (!fs.existsSync(sceneTempTxt)) {
            await fs.promises.mkdir(sceneTempTxt, { recursive: true });
        }

        for (const fileName of scenefileNameList) {
            console.log('开始替换文件：', fileName);
            await changeFile(fileName, sceneTempTxt, true);
        }

        if (!fs.existsSync(apiTempTxt)) {
            await fs.promises.mkdir(apiTempTxt, { recursive: true });
        }

        for (const fileName of apifileNameList) {
            await changeFile(fileName, apiTempTxt, false);
        }
        await writeFileAsync(recordFile, recordContent, 'utf8');
    } catch (err) {
        console.error(err);
    }
}

function isrpcExtesionFile(file_name) {
    for (let k of Object.keys(modifyFile)) {
        if (file_name.startsWith(k)) {
            return true;
        }
    }
    return false;
}

function getFileName(file_path) {
    let file_name = path.basename(file_path);
    return file_name;
}

const modifyCamera = [
    'ModifiedCameraSystem',
    'CameraModifid',
    'CameraSystemData',
];
const modifyPlayer = [
    'PlayerManagerExtesion',
];
const modifySpawn = [
    'SpawnManager',
    'SpawnInfo',
];
const modifyStatic = [
    'GeneralManager',
];
const modifyFile = {
    'ModifiedCamera': modifyCamera,
    'ModifiedPlayer': modifyPlayer,
    'ModifiedSpawn': modifySpawn,
    'ModifiedStaticAPI': modifyStatic,
};

function addImport() {
    // 获取当前工作目录
    const currentDir = process.cwd();

    // 遍历整个项目文件夹
    for (let [root, dirs, file] of walkSync(currentDir)) {
        // 遍历所有的.ts文件
        if (file.endsWith('.ts')) {
            let file_path = path.join(root, file);
            let content;
            content = fs.readFileSync(file_path, 'utf-8');
            if (isrpcExtesionFile(file)) {
                continue;
            }
            for (let [k, v] of Object.entries(modifyFile)) {
                for (let item of v) {
                    if (content.includes(item)) {
                        // 根据文件夹位置添加对应的导入语句
                        let relative_path = path.relative(currentDir, file_path);
                        let levels = relative_path.split(path.sep).length - 2;
                        let import_path = '../'.repeat(levels) + 'Modified027Editor/';
                        if (levels === 0) {
                            import_path = './Modified027Editor/';
                        }
                        let importFiles = '';
                        for (let item of v) {
                            importFiles += item + ',';
                        }
                        let import_statement = `import { ${importFiles} } from '${import_path + k}';\n`;
                        let message = import_path.concat(k);
                        //判断文件头部是否已经有导入语句
                        if (content.startsWith("import") && content.includes("from") && content.includes(message)) {
                            console.log(getFileName(file_path), '文件中使用了拓展API', '已经导入过');
                            break;
                        }
                        // 在文件头部添加导入语句
                        content = import_statement + content;
                        console.log(getFileName(file_path), '文件中使用了拓展API', '导入成功');
                        break;
                    }
                }
            }
            fs.writeFileSync(file_path, content, 'utf-8');
        }
    }
}

// 递归遍历文件夹
function* walkSync(dir) {
    const files = fs.readdirSync(dir);
    for (let file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            yield* walkSync(filePath);
        } else {
            yield [dir, files, file];
        }
    }
}



async function allMain() {

    await main();
    deleteDir(apiTempTxt);
    deleteDir(sceneTempTxt);
    addImport();

}

allMain();


