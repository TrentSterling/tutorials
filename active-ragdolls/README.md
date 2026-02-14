# Active Ragdolls (Physical Characters)

Active ragdolls move beyond "canned" animations by using a physics-driven skeleton. Instead of just playing a clip, the ragdoll uses **PD Controllers** to force its limbs to follow an animated target, resulting in characters that stumble, react to impacts, and feel truly physical.

## 1. The Dual Skeleton System
To make an active ragdoll, you need two versions of the character:
1. **The Ghost (Kinematic):** A standard invisible skeleton that plays traditional animations. It has no physics.
2. **The Body (Physical):** A collection of Rigidbodies and Joints (the Ragdoll) that exists in the world.

## 2. Driving Limbs with PD Controllers
The "Active" part comes from driving the Body's joints to match the Ghost's rotations.
- **Target:** The rotation of the bone in the animated "Ghost."
- **Current:** The rotation of the physical Rigidbody bone.
- **Control:** We use **Joint Drives** (which are essentially PD Controllers) to apply torque.

## 3. The "Keep Upright" Force
The hardest part of an active ragdoll is preventing it from collapsing into a pile of meat.
- We apply a specific "Upright Torque" to the hips.
- This torque calculates the error between the character's `transform.up` and the world `Vector3.up` and forces the hips to stay vertical.

## 4. Why use Active Ragdolls?
- **Procedural Reaction:** If a character walks into a wall, their arm naturally bends and pushes back.
- **Dynamic Impacts:** When hit by a projectile, the character flinches physically rather than playing a "Hit" animation.
- **Emergent Fun:** Used famously in *Gang Beasts*, *Human Fall Flat*, and *TABS* for their "drunken," physical feel.

## 5. Implementation Strategy
```csharp
// Simplistic Hip-Leveling Logic
void FixedUpdate() {
    Quaternion uprightError = Quaternion.FromToRotation(transform.up, Vector3.up);
    rb.AddTorque(uprightError.x * kP, uprightError.y * kP, uprightError.z * kP);
    
    // Joint Drives handle the rest of the limbs
    foreach(var joint in limbs) {
        joint.targetRotation = ghostLimbs[i].localRotation;
    }
}
```

## 6. Summary
- **Physics first:** All movement is done via forces/torques.
- **Hybrid approach:** Mixes the control of traditional animation with the reactivity of physics.
- **The Core:** Requires stable **PD/SPD controllers** to prevent the limbs from oscillating.
