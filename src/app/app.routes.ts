import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'alphabet', pathMatch: 'full' },
  { path: 'lessons', loadComponent: () => import('./pages/lessons.component').then(m => m.LessonsComponent) },
  { path: 'alphabet', loadComponent: () => import('./pages/alphabet.component').then(m => m.AlphabetComponent) },
  { path: 'tracing', loadComponent: () => import('./pages/tracing.component').then(m => m.TracingComponent) },
  { path: 'phrases', loadComponent: () => import('./pages/phrases.component').then(m => m.PhrasesComponent) },
  { path: 'junior', loadComponent: () => import('./pages/junior-conversations.component').then(m => m.JuniorConversationsComponent) },
  { path: 'speech', loadComponent: () => import('./pages/speech-coach.component').then(m => m.SpeechCoachComponent) },
  { path: 'certificates', loadComponent: () => import('./pages/certificates.component').then(m => m.CertificatesComponent) },
  { path: 'stories', loadComponent: () => import('./pages/stories.component').then(m => m.StoriesComponent) },
  { path: 'numbers', loadComponent: () => import('./pages/numbers.component').then(m => m.NumbersComponent) },
  { path: 'categories', loadComponent: () => import('./pages/categories.component').then(m => m.CategoriesComponent) },
  { path: 'games', loadComponent: () => import('./pages/games.component').then(m => m.GamesComponent) },
  { path: 'stickers', loadComponent: () => import('./pages/stickers.component').then(m => m.StickersComponent) },
  { path: 'pet', loadComponent: () => import('./pages/pet.component').then(m => m.PetComponent) },
  { path: 'parent', loadComponent: () => import('./pages/parent.component').then(m => m.ParentComponent) },
  { path: 'profiles', loadComponent: () => import('./pages/profiles.component').then(m => m.ProfilesComponent) },
  { path: 'missions', loadComponent: () => import('./pages/missions.component').then(m => m.MissionsComponent) },
  { path: 'worksheets', loadComponent: () => import('./pages/worksheets.component').then(m => m.WorksheetsComponent) },
  { path: 'arabic', loadComponent: () => import('./pages/arabic.component').then(m => m.ArabicComponent) },
  { path: 'privacy', loadComponent: () => import('./pages/privacy.component').then(m => m.PrivacyComponent) },
  { path: '**', redirectTo: 'alphabet' }
];
