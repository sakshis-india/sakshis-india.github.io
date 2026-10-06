---
title: Shipping an EDR Agent: Code Signing, Signed Manifests, and Rollback That Actually Works
date: 2026-10-05
tags: EDR, Endpoint Security, Code Signing, CI/CD, Release Engineering, Secure SDLC, Cybersecurity
description: What it takes to ship an endpoint agent to Windows, macOS, and Linux fleets — the signing chain, stable vs edge release channels, signed update manifests, and migrating off a legacy agent without stranding endpoints.
---

## The Update Channel Is Part of Your Threat Model

I spent four years on the other side of this problem. As a network security engineer I pushed firewall content updates, chased GlobalProtect client versions across enterprise fleets, and took the escalation calls when an agent upgrade went sideways on a few thousand endpoints. Then I moved to building an endpoint detection and response agent, and the view from here is different in one specific way:

**An EDR agent runs with the highest privilege on every machine you own, and it updates itself.** That makes your release pipeline a distribution channel into the most sensitive process on the endpoint. If an attacker can influence what that agent downloads and executes, they do not need an exploit — they have a signed, privileged, fleet-wide deployment mechanism, courtesy of your own build system.

So the pipeline is not release-engineering plumbing that sits next to the security product. It *is* part of the security product. Here is how I've come to build it.

## Signing Is Three Different Problems, Not One

"We sign our binaries" sounds like a single checkbox. Ship to Windows, macOS, and Linux and it is three unrelated trust systems, each with its own failure modes.

**Windows.** Authenticode signing with a code-signing certificate, timestamped by an RFC 3161 server. The timestamp matters more than people expect: without it, every binary you have ever shipped stops validating the day the certificate expires. With it, signatures stay verifiable, because the timestamp proves the signing happened while the certificate was valid. Kernel-level components raise the bar further — those need the appropriate Microsoft attestation path, and that is a lead-time problem to plan around, not a thing to discover during a release.

**macOS.** Signing is only half of it. You sign with a Developer ID identity, then submit to Apple for **notarization**, then staple the ticket to the artifact. Skip notarization and Gatekeeper blocks the install on a current macOS, with a message that reads to the end user like your software is malware. The practical trap is that notarization is a network round-trip to Apple inside your build — so the pipeline has to tolerate it being slow, and has to fail loudly rather than quietly shipping an un-notarized artifact.

**Linux.** No single platform authority, so trust rides on the package ecosystem: GPG-signed `.deb` and `.rpm` packages served from a signed repository, with your public key distributed out of band. The hard part is key distribution and rotation across distros, not the signing itself.

The lesson I would pass on: **do not treat signing as a build step you bolt on at the end.** Each platform has a different trust anchor, a different expiry story, and a different way of failing. Model all three up front.

### Keys Do Not Belong on Build Machines

The signing key is the whole game. If it leaks, an attacker signs their payload with your identity and every endpoint you own accepts it as genuine.

So the private key lives in an HSM or a managed signing service — never in a repository, never in a plain CI secret, never on a developer laptop. CI gets the ability to *request* a signature, not possession of the key. Signing requests are authenticated, scoped, and logged, so there is an audit trail of which build asked for which signature and when. Access to that signing path is the single most important permission in the organization, and it deserves tighter review than production database access.

## Signed Manifests: Trust the Instruction, Not Just the Binary

Signing the binary proves the binary is yours. It says nothing about whether *this* binary is the one the fleet should be running right now.

That gap is real. An attacker who can tamper with your update metadata does not need to forge a signature — they can serve an *older, genuinely signed* build of your agent, one with a vulnerability you patched six months ago. Every signature validates. The endpoint happily downgrades itself into a known-exploitable state.

The fix is to sign the instruction as well as the payload. A **signed manifest** is a small document the agent fetches and verifies before it fetches anything else, describing the release:

- the version the channel should be on
- artifact URLs per platform and architecture
- a cryptographic hash for each artifact
- a monotonic counter or version floor, so an older manifest cannot replace a newer one
- an expiry, so a captured manifest cannot be replayed indefinitely

The agent verifies the manifest signature, checks it is neither stale nor a rollback, downloads the artifact, verifies the hash matches what the manifest claims, verifies the artifact's own platform signature, and only then installs. Hash *and* signature, because they answer different questions: the signature says "we built this," the hash says "this is the exact build the manifest authorized."

## Stable and Edge: Two Channels, One Pipeline

Shipping one build to everyone simultaneously means your blast radius equals your fleet. I run two channels off the same pipeline and the same signing chain.

**Edge** gets the release first — internal machines and a small set of deliberately enrolled endpoints spanning the OS versions and configurations that actually exist in the fleet. Not a clean lab. The whole point is to meet the messy real-world combinations before the fleet does.

**Stable** is what the fleet runs. A build is promoted to stable only after it has held on edge long enough to show telemetry, and promotion is a manifest change — not a rebuild. The artifact promoted to stable is bit-for-bit the artifact that was validated on edge: same hash, same signature. Rebuilding for promotion would mean the thing you tested is not the thing you shipped.

Two details matter in practice. First, **channel assignment lives server-side**, so moving an endpoint between channels does not require touching the endpoint. Second, **the agent reports its running version back**, because without that you have no idea what your fleet is actually on — only what you *told* it to be on, and those two diverge faster than anyone expects.

## Migrating Off a Legacy Agent Without Stranding Endpoints

The genuinely uncomfortable work is not the greenfield install. It is the endpoints already running an older agent, built with different assumptions, which have to end up on the new one without a human touching the machine.

What I have learned to hold onto:

**The old agent has to be able to install its replacement.** Whatever the legacy version can do is the ceiling on your migration options. If it has no mechanism to fetch and launch a signed installer, your migration is a manual project — and you want to learn that by auditing the oldest version in the fleet early, not by discovering it mid-rollout.

**Rollback is a designed feature, not an undo button.** Versions have to be installable in both directions, and the manifest's version floor has to be explicitly movable by an operator so a bad release can be pulled. If rollback exists only as "we will re-release the old build," you do not have rollback — you have a second release under time pressure.

**Decide what happens to state.** Configuration, local caches, pending telemetry, quarantine data. Migrate it or deliberately discard it, but make that an explicit decision per data type. Unexamined state is what makes a rollback fail.

**The failure mode to engineer against is an endpoint with no working agent.** Not "upgrade failed" — that one is recoverable and visible. The dangerous case is an endpoint where the old agent was removed and the new one never came up, because that machine is now unmonitored and, worse, *silently* unmonitored. Install the new agent and confirm it is healthy and reporting before retiring the old one. Never the reverse order.

**Stage it, and watch the right signal.** A small cohort, then wider, with a defined hold at each step. The signal that matters is not "did the installer exit zero" — it is **are these endpoints still reporting in**, on the new version, with their detection pipeline functioning. An installer can succeed on a machine that is now effectively dark.

## What I Would Tell My Former Self

The thing I did not appreciate as an operator is how much of an endpoint agent's security posture is decided in the release pipeline rather than in the detection logic. Signing keys in an HSM, signed manifests with rollback protection and expiry, bit-identical promotion between channels, and a migration that proves the new agent is healthy before retiring the old one — none of that is detection engineering, and all of it determines whether the agent can be turned against the fleet it is there to protect.

If you are running an EDR deployment rather than building one, the questions worth asking your vendor are the same ones. Where does the signing key live? Is the update manifest signed and rollback-protected? Can you pin a version and roll back on your own schedule? What happens on an endpoint where the upgrade fails halfway? The answers tell you a great deal about what you have installed.
