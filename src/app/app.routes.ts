import { Routes } from '@angular/router';
import { AlphabetComponent } from './pages/alphabet.component';
import { LessonsComponent } from './pages/lessons.component';
import { TracingComponent } from './pages/tracing.component';
import { PhrasesComponent } from './pages/phrases.component';
import { StoriesComponent } from './pages/stories.component';
import { NumbersComponent } from './pages/numbers.component';
import { CategoriesComponent } from './pages/categories.component';
import { StickersComponent } from './pages/stickers.component';
import { GamesComponent } from './pages/games.component';
import { SpeechCoachComponent } from './pages/speech-coach.component';
import { JuniorConversationsComponent } from './pages/junior-conversations.component';
import { CertificatesComponent } from './pages/certificates.component';

export const routes: Routes = [
  { path: '', redirectTo: 'alphabet', pathMatch: 'full' },
  { path: 'lessons', component: LessonsComponent },
  { path: 'alphabet', component: AlphabetComponent },
  { path: 'tracing', component: TracingComponent },
  { path: 'phrases', component: PhrasesComponent },
  { path: 'junior', component: JuniorConversationsComponent },
  { path: 'speech', component: SpeechCoachComponent },
  { path: 'certificates', component: CertificatesComponent },
  { path: 'stories', component: StoriesComponent },
  { path: 'numbers', component: NumbersComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'games', component: GamesComponent },
  { path: 'stickers', component: StickersComponent },
  { path: '**', redirectTo: 'alphabet' }
];
