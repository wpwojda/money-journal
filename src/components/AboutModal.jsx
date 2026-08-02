import { Modal } from "./common/Modal.jsx";
import { APP_VERSION } from "../constants.js";

/**
 * Explains what the project is and, more importantly, what it deliberately does not do.
 * The privacy claims here are the same ones made in the README and SECURITY.md - if any
 * of them ever stops being true, all three need to change together.
 */
export function AboutModal({ onClose }) {
  const guarantees = [
    "No user accounts, and nothing to sign up for",
    "No authentication, because there is no server",
    "No analytics, telemetry, or usage tracking",
    "No cloud storage or external database",
    "No bank connections and no payment APIs",
    "No third-party requests at all - even the font is bundled locally",
  ];

  return (
    <Modal title="About Money Journal" onClose={onClose} wide>
      <div className="space-y-5">
        <p className="text-sm text-secondary-c leading-relaxed">
          Money Journal is a private personal finance journal and dashboard. It tracks what comes in,
          what goes out, and what is still planned for the month - and nothing else. It is not a
          banking app, a fintech product, or an accounting system.
        </p>

        <div>
          <h4 className="text-xs font-semibold text-muted-c uppercase tracking-wide mb-2">
            Privacy-first, by design
          </h4>
          <p className="text-sm text-secondary-c leading-relaxed mb-3">
            Every number you enter is stored in this browser&apos;s local storage, on this device.
            The app is a static site with no backend, so there is nowhere for your data to be sent
            even in principle.
          </p>
          <ul className="space-y-1.5">
            {guarantees.map((g) => (
              <li key={g} className="flex items-start gap-2 text-sm text-secondary-c">
                <span className="text-emerald-500 mt-0.5 shrink-0" aria-hidden="true">
                  ✓
                </span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="surface-muted rounded-xl p-3.5">
          <h4 className="text-xs font-semibold text-muted-c uppercase tracking-wide mb-1.5">
            What that means for you
          </h4>
          <p className="text-sm text-secondary-c leading-relaxed">
            Because there is no cloud copy, your data lives and dies with this browser profile.
            Clearing your browser data will erase it. Money Journal keeps an automatic backup
            snapshot on this device, but you should still export a JSON backup from Settings now and
            then and keep it somewhere safe.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-c pt-1">
          <span>Version {APP_VERSION}</span>
          <span>MIT licensed &middot; open source</span>
        </div>
      </div>
    </Modal>
  );
}
