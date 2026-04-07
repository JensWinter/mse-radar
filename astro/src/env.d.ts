import type { User } from '@models/aggregates/user.ts';
import type { Dependencies } from '@lib/dependencies.ts';

interface Window {
  Alpine: import('alpinejs').Alpine;
}

declare global {
  namespace App {
    interface Locals extends Dependencies {
      user: User | null;
    }
  }
}
