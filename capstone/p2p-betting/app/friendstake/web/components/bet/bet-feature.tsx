'use client';

import { AppHero } from '../ui/ui-layout';

const links: { label: string; href: string }[] = [
  { label: 'Friendstake X', href: 'https://twitter.com/friendstake_xyz' },
];

export default function BetFeature() {
  return (
    <div>
      <AppHero title="Friendstake" subtitle="Bet on anything." />
      <div className="max-w-xl mx-auto py-6 sm:px-6 lg:px-8 text-center">
        <div className="space-y-2">
          <p>Find out more</p>
          {links.map((link, index) => (
            <div key={index}>
              <a
                href={link.href}
                className="link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
