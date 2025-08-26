
export declare const createActor: (
  canisterId: string | Principal,
  options?: CreateActorOptions
) => ActorSubclass<_SERVICE>;

/**
 * Intialized Actor using default settings, ready to talk to a canister using its candid interface
 * @constructs {@link ActorSubClass}
 */
export declare const gami_backend: ActorSubclass<_SERVICE>;
