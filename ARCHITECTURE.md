# Architecture Frontend — Application de formulaires de suivi

> Document destiné à **Claude Code**. Décrit l'architecture du frontend React, le système de design, le théming dynamique et la gestion des templates. À lire avec le document backend `ARCHITECTURE.md` (l'API et le modèle de templates y sont définis).

---

## 1. Périmètre & exigences

Une application web qui sert trois expériences :

1. **Espace admin** — créer, organiser et publier des formulaires (builder), gérer les templates.
2. **Formulaire public** — remplir un formulaire via un lien partagé, sur mobile comme sur desktop.
3. **Tableau de bord statistiques** — visualiser les réponses agrégées.

Exigences transverses, **non négociables** :

- **Moderne & élégant** : direction esthétique affirmée, jamais générique (voir §13).
- **Responsive** : mobile-first ; le formulaire public doit être irréprochable sur petit écran.
- **Dynamique** : transitions fluides, micro-interactions, aperçu en temps réel, mises à jour optimistes.
- **Templates** : choisir un template existant et **créer** ses propres templates (thème visuel + structure de départ).
- **Formulaire = expérience web** : chaque formulaire se présente comme un mini-site — écran de couverture, sections (pages ou ancres), blocs de contenu riches (titres, texte, images) intercalés entre les questions, écran de fin, URL propre (`/f/{slug}`) avec aperçu de partage.

---

## 2. Stack technique

| Élément | Choix | Rôle |
|---|---|---|
| Framework | React 18 + TypeScript | UI typée |
| Build | Vite | Dev rapide, build optimisé |
| Styles | Tailwind CSS + variables CSS | Utilitaires + théming runtime (clé des templates, §5) |
| Primitives UI | Radix UI (pattern shadcn/ui) | Composants accessibles non stylés |
| État serveur | TanStack Query | Cache, invalidation, optimistic updates |
| État UI local | Zustand | État léger (builder, préférences) |
| Formulaires | React Hook Form + Zod | Validation typée, perfs |
| Drag & drop | dnd-kit | Réorganisation des questions (builder) |
| Animation | Motion (Framer Motion) | Transitions, reveals, micro-interactions |
| Graphiques | Recharts | Tableau de bord statistiques |
| HTTP | Axios (wrapper interne) | Intercepteurs JWT |
| Routing | React Router v7 | |
| Tests | Vitest + Testing Library + Playwright | Unitaire, intégration, e2e |

> Polices : **ne pas** utiliser Inter / Roboto / system-ui par défaut. Choisir une paire distinctive (display + corps) — voir §13.

---

## 3. Principes d'architecture

- **Organisation par fonctionnalité (feature-based)**, pas par type technique. Chaque feature est autonome : ses composants, hooks, appels API et pages vivent ensemble.
- **`shared/` pour le transverse** uniquement (design system, client API, utilitaires, types communs).
- **Le rendu d'un formulaire est piloté par les données** : un composant unique lit le schéma JSON d'un formulaire et produit l'UI. Le même moteur sert au builder (aperçu), à la page publique et à l'aperçu de template.
- **Le théming est découplé du contenu** : un thème est un jeu de *tokens* appliqués via variables CSS ; changer de template ne touche jamais le code des composants.
- **Séparation état serveur / état UI** : les données distantes passent par TanStack Query (jamais dupliquées dans un store) ; Zustand ne gère que l'état d'interface éphémère.
- **Accessibilité par construction** : primitives Radix, navigation clavier, labels, contrastes (§10).

---

## 4. Structure des dossiers

```
src/
├── main.tsx
├── app/
│   ├── App.tsx
│   ├── router.tsx                 # routes + lazy loading par feature
│   ├── providers.tsx              # QueryClient, ThemeProvider, AuthProvider
│   └── queryClient.ts
│
├── shared/
│   ├── ui/                        # design system (voir §5)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Dialog.tsx
│   │   ├── Tabs.tsx
│   │   └── Toast.tsx
│   ├── lib/
│   │   ├── apiClient.ts           # Axios + intercepteur JWT + gestion 401
│   │   └── cn.ts                  # merge de classes Tailwind
│   ├── hooks/
│   └── types/                     # types partagés (Form, Question, Theme…)
│
├── design-system/
│   ├── tokens.ts                  # définition des tokens (couleurs, type, radius…)
│   ├── ThemeProvider.tsx          # injecte les tokens en variables CSS
│   ├── useTheme.ts
│   └── themes/                    # thèmes intégrés (par défaut)
│       ├── minimal.ts
│       ├── editorial.ts
│       └── vibrant.ts
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── pages/                 # Login, Register
│   │   └── useAuth.ts
│   │
│   ├── form-renderer/             # CŒUR : rend toute l'expérience (microsite)
│   │   ├── fields/                # composants de question
│   │   │   ├── TextField.tsx
│   │   │   ├── LongTextField.tsx
│   │   │   ├── SingleChoiceField.tsx
│   │   │   ├── MultiChoiceField.tsx
│   │   │   ├── ScaleField.tsx
│   │   │   ├── NumberField.tsx
│   │   │   └── DateField.tsx
│   │   ├── blocks/                # blocs de contenu non-question
│   │   │   ├── HeadingBlock.tsx
│   │   │   ├── RichTextBlock.tsx
│   │   │   ├── ImageBlock.tsx
│   │   │   ├── DividerBlock.tsx
│   │   │   └── EmbedBlock.tsx
│   │   ├── fieldRegistry.ts       # type de question -> composant
│   │   ├── blockRegistry.ts       # type de bloc -> composant
│   │   ├── FieldRenderer.tsx      # rend un champ selon son type
│   │   ├── BlockRenderer.tsx      # rend un bloc de contenu
│   │   ├── SectionRenderer.tsx    # fusionne questions + blocs ordonnés d'une section
│   │   ├── CoverScreen.tsx        # écran d'accueil (titre, image, CTA)
│   │   ├── EndingScreen.tsx       # écran de fin (message, redirection)
│   │   ├── ProgressBar.tsx        # progression (modes paginated / single-question)
│   │   ├── FormExperience.tsx     # orchestre cover -> sections -> ending selon `presentation`
│   │   └── buildZodSchema.ts      # schéma de validation dérivé du formulaire
│   │
│   ├── forms/                     # espace admin
│   │   ├── api/
│   │   ├── pages/                 # FormList, FormEdit
│   │   ├── components/
│   │   │   ├── builder/
│   │   │   │   ├── FormBuilder.tsx
│   │   │   │   ├── SectionList.tsx         # sections (pages) en dnd-kit
│   │   │   │   ├── SectionEditor.tsx       # questions + blocs d'une section, dnd-kit
│   │   │   │   ├── QuestionEditorCard.tsx
│   │   │   │   ├── ContentBlockEditor.tsx  # titre, texte, image, séparateur, embed
│   │   │   │   ├── QuestionTypePicker.tsx
│   │   │   │   ├── BlockTypePicker.tsx
│   │   │   │   ├── CoverEditor.tsx
│   │   │   │   ├── EndingEditor.tsx
│   │   │   │   ├── PresentationModePicker.tsx
│   │   │   │   └── BuilderPreview.tsx      # réutilise FormExperience
│   │   │   └── FormCard.tsx
│   │   └── hooks/
│   │
│   ├── templates/                 # choisir / créer (voir §8)
│   │   ├── api/
│   │   ├── pages/                 # TemplateGallery, TemplateEditor
│   │   ├── components/
│   │   │   ├── TemplateCard.tsx
│   │   │   ├── ThemeEditor.tsx            # palette, typo, radius, layout, fond
│   │   │   ├── ThemePreview.tsx           # aperçu live via FormRenderer
│   │   │   └── colorPicker, fontPicker…
│   │   └── hooks/
│   │
│   ├── public-form/               # remplissage public
│   │   ├── pages/PublicFormPage.tsx
│   │   └── components/
│   │
│   └── statistics/                # tableau de bord
│       ├── api/
│       ├── pages/StatisticsPage.tsx
│       └── components/
│           ├── StatCard.tsx
│           ├── ChoiceChart.tsx           # barres / camembert
│           ├── ScaleChart.tsx            # distribution
│           ├── TextAnswersList.tsx
│           └── ResponsesTimeline.tsx
│
└── styles/
    └── globals.css                # base Tailwind + variables CSS racine
```

---

## 5. Système de design & théming (cœur des templates)

C'est le mécanisme central : **un thème = un jeu de tokens, appliqué via variables CSS**. Tailwind est configuré pour lire ces variables, donc changer de template restyle instantanément toute l'UI sans toucher au markup.

### Tokens d'un thème

```ts
// design-system/tokens.ts
export interface Theme {
  name: string;
  palette: {
    primary: string;      // accent principal
    background: string;
    surface: string;      // cartes, champs
    text: string;
    textMuted: string;
    border: string;
  };
  typography: {
    displayFont: string;  // titres
    bodyFont: string;     // corps
    scale: 'compact' | 'comfortable' | 'spacious';
  };
  radius: 'sharp' | 'soft' | 'round';   // -> 0 / 8px / 16px
  layout: 'card' | 'single-question' | 'classic'; // style des blocs
  presentation: 'single-question' | 'paginated' | 'onepage'; // façon Typeform / pages / microsite scrollable
  background: { type: 'solid' | 'gradient' | 'pattern'; value: string };
}
```

### Application runtime

```tsx
// design-system/ThemeProvider.tsx — applique les tokens en variables CSS
function applyTheme(theme: Theme, root: HTMLElement) {
  root.style.setProperty('--color-primary', theme.palette.primary);
  root.style.setProperty('--color-bg', theme.palette.background);
  root.style.setProperty('--color-surface', theme.palette.surface);
  root.style.setProperty('--font-display', theme.displayFont);
  root.style.setProperty('--radius', radiusMap[theme.radius]);
  // … etc.
}
```

```js
// tailwind.config.js — Tailwind consomme les variables
theme: {
  extend: {
    colors: {
      primary: 'var(--color-primary)',
      surface: 'var(--color-surface)',
    },
    borderRadius: { theme: 'var(--radius)' },
    fontFamily: { display: 'var(--font-display)', body: 'var(--font-body)' },
  },
}
```

Conséquence : le **même** moteur (`FormExperience`) rend un formulaire « minimal » ou « vibrant » selon le thème injecté. L'aperçu du builder et l'éditeur de template réutilisent ce mécanisme avec un `ThemeProvider` local (scopé à un conteneur) pour ne pas affecter le reste de l'app.

### Composants `shared/ui`

Construits sur Radix (accessibilité) + Tailwind, ils consomment les tokens (`bg-surface`, `rounded-theme`, `font-body`). Ils restent **neutres** : c'est le thème qui leur donne leur apparence.

---

## 6. Moteur de rendu : l'expérience complète

`FormExperience` reçoit le schéma complet (issu de l'API : `cover`, `sections`, `questions`, `content_blocks`, `ending`, `theme`, `presentation`) et orchestre le parcours comme un mini-site :

1. Affiche l'écran de **couverture** (`CoverScreen`) s'il est défini : titre, image, bouton « Commencer ».
2. Parcourt les **sections** selon le mode `presentation` :
   - `single-question` → une question par écran, transitions animées, progression.
   - `paginated` → une page par section, navigation précédent/suivant.
   - `onepage` → toutes les sections empilées, scroll fluide (type landing page).
3. Dans chaque section, `SectionRenderer` fusionne **questions** et **blocs de contenu** par `position`, puis délègue à `FieldRenderer` (via `fieldRegistry`) ou `BlockRenderer` (via `blockRegistry`).
4. Construit la validation Zod (`buildZodSchema`) à partir des seules questions ; gère la soumission (admin = aperçu inactif ; public = POST réponse) puis affiche l'**écran de fin** (`EndingScreen`).

Extensibilité par registres :
- Ajouter un **type de question** = un composant dans `fields/` + une entrée dans `fieldRegistry`.
- Ajouter un **type de bloc** (ex. vidéo) = un composant dans `blocks/` + une entrée dans `blockRegistry`.

Aucune autre modification — cela reflète la flexibilité du backend (`questions.config` et `content_blocks.content` en JSONB).

---

## 7. Builder de formulaires

- Organisation en **sections** (= pages/étapes) ; chaque section contient des questions et des blocs de contenu, tous réorganisables en **drag & drop** (dnd-kit), ajout via `QuestionTypePicker` et un sélecteur de blocs.
- Chaque question s'édite dans une carte (libellé, options, requis, config spécifique au type) ; chaque bloc de contenu a son éditeur (titre, texte riche, image, séparateur, embed).
- Éditeurs dédiés pour l'**écran de couverture** et l'**écran de fin**, et un sélecteur de **mode de présentation** (`single-question` / `paginated` / `onepage`).
- **Aperçu live** côte à côte (`BuilderPreview`) qui réutilise `FormExperience` avec le thème courant — l'utilisateur voit le microsite final en temps réel.
- Mises à jour **optimistes** via TanStack Query ; sauvegarde automatique (debounce) en brouillon.
- Une fois publié, l'édition structurelle est verrouillée (cohérent avec la règle backend).

---

## 8. Templates : choisir & créer

### Choisir

`TemplateGallery` affiche les templates **intégrés** (fournis par le système) et **ceux de l'utilisateur**, sous forme de cartes avec aperçu visuel. À la création d'un formulaire, l'utilisateur peut partir d'un template : le thème **et** la structure de départ (questions pré-remplies, optionnelles) sont copiés dans le nouveau formulaire.

### Créer

`TemplateEditor` permet de composer un thème :

- `ThemeEditor` : palette (sélecteurs de couleur), paire de polices, arrondi, densité, disposition, type de fond.
- `ThemePreview` : aperçu live d'un formulaire d'exemple rendu avec le thème en cours d'édition (réutilise `FormExperience` + `ThemeProvider` scopé).
- Optionnel : attacher une **structure de départ** (un ensemble de questions) au template.
- Sauvegarde → `POST /templates` (voir backend). L'utilisateur peut rendre un template public ou privé.

> Important : quand un formulaire est créé depuis un template, on copie un **snapshot** du thème dans le formulaire. Modifier le template plus tard ne doit pas altérer les formulaires déjà créés.

---

## 9. Tableau de bord statistiques

- Appelle `GET /forms/{id}/statistics`. La réponse porte, par question, un `type` qui détermine le composant de visualisation.
- `ChoiceChart` (barres/camembert) pour les choix, `ScaleChart` (distribution + moyenne) pour les échelles, `TextAnswersList` (paginée) pour le texte, `ResponsesTimeline` pour l'évolution dans le temps.
- Cartes d'indicateurs globaux en haut (total réponses, taux de complétion, dernière soumission).
- Graphiques **responsive** (conteneur fluide) et animés à l'apparition.
- Export CSV via `GET /forms/{id}/export` (phase 2).

---

## 10. Responsive & accessibilité

- **Mobile-first** : styles de base pour mobile, breakpoints Tailwind (`sm md lg xl`) pour enrichir.
- Le **formulaire public** est la priorité mobile : champs pleine largeur, cibles tactiles ≥ 44px, clavier adapté (`inputMode`), pas de scroll horizontal.
- Le **builder** est pensé desktop ; sur mobile, basculer en mode liste simplifié (aperçu empilé sous l'édition).
- Navigation **clavier** complète, focus visibles, `aria-*` via Radix, labels associés à chaque champ.
- Contraste AA minimum — **à valider pour chaque template** : l'éditeur de thème doit avertir si le contraste texte/fond est insuffisant.
- `prefers-reduced-motion` respecté : désactiver les animations non essentielles.

---

## 11. État, données & sécurité côté client

- **TanStack Query** pour tout l'état serveur : clés de cache par ressource (`['forms']`, `['form', id]`, `['statistics', id]`), invalidation après mutation, `staleTime` raisonnable.
- **Zustand** uniquement pour l'UI : état du builder en cours d'édition, préférences, thème actif.
- **Auth** : JWT stocké de façon sécurisée, ajouté par l'intercepteur Axios ; sur `401`, redirection vers login. Routes admin protégées par un garde de route.
- Les pages `public-form` n'exigent pas d'auth.

---

## 12. Routing

```
/login, /register                      → auth
/                                       → liste des formulaires (admin, protégé)
/forms/new                              → choix template puis builder
/forms/:id/edit                         → builder
/forms/:id/statistics                   → tableau de bord
/templates                              → galerie
/templates/new, /templates/:id/edit     → éditeur de template
/f/:slug                                → microsite public (sans chrome admin)
```

Lazy-loading par feature (React.lazy + Suspense) pour des bundles légers. La page publique (`/f/:slug`) génère ses **balises Open Graph** (titre, image de couverture) à partir du schéma renvoyé par l'API, pour un partage soigné sur les réseaux.

---

## 13. Direction esthétique (moderne & élégant)

Deux niveaux distincts à ne pas confondre :

**Le « chrome » de l'application** (dashboard, builder, galerie) a **une** identité visuelle cohérente et raffinée, fixée par l'équipe — sobre, spacieuse, élégante. Recommandations concrètes :

- **Typographie distinctive** : une paire caractérielle (un display avec de la personnalité + un corps lisible et raffiné). Éviter absolument Inter/Roboto/Arial/system-ui.
- **Palette dominante + accent net** : une couleur dominante affirmée et un accent tranchant, plutôt qu'une palette timide et uniforme. Bannir le cliché « dégradé violet sur fond blanc ».
- **Espace négatif généreux**, hiérarchie typographique forte, alignements précis.
- **Motion ciblée** : un chargement de page bien orchestré (reveals échelonnés via délais) marque plus qu'une myriade de micro-animations dispersées. Transitions de route fluides, états de survol qui surprennent légèrement.
- **Profondeur et matière** : ombres maîtrisées, bordures décoratives subtiles, textures légères — éviter le plat générique.
- Choisir clairement **clair ou sombre** (ou les deux) et l'exécuter avec précision.

**Les formulaires eux-mêmes** sont **thémables** par l'utilisateur via les templates (§5, §8). Les thèmes intégrés (`minimal`, `editorial`, `vibrant`…) doivent chacun avoir un parti pris fort et assumé, pour montrer l'étendue du système.

Principe directeur : l'intentionnalité prime sur l'intensité. Un minimalisme raffiné et un maximalisme contrôlé fonctionnent tous deux — ce qui ne fonctionne pas, c'est le générique.

---

## 14. Feuille de route (ordre d'implémentation)

**Phase 1 — Formulaire fonctionnel**
1. Setup Vite + TS + Tailwind + variables CSS + design system de base (`shared/ui`).
2. `ThemeProvider` + tokens + un thème par défaut.
3. Auth (pages + garde de route + intercepteur).
4. `FieldRenderer` + champs + validation Zod (formulaire à plat, une section).
5. Espace admin : liste + builder (questions en drag & drop, aperçu live) + publication.
6. Page publique de remplissage + soumission.

**Phase 2 — Expérience web & statistiques**
7. `FormExperience` complet : couverture, sections, blocs de contenu, écran de fin, modes de présentation ; builder étendu (sections, blocs, cover/ending) ; route `/f/:slug` + Open Graph.
8. Tableau de bord statistiques + graphiques.
9. Export CSV.

**Phase 3 — Templates & finitions**
10. Templates : galerie (choisir) + éditeur de thème (créer) + structure de départ.
11. Logique conditionnelle, partage par lien, thème sombre app, animations avancées.

> Le rendu dynamique (étape 4) et le `ThemeProvider` (étape 2) sont les fondations : tout le reste s'appuie dessus. Les implémenter en premier et soigneusement. `FormExperience` (étape 7) enveloppe le `FieldRenderer` de l'étape 4 — le construire de façon à pouvoir l'enrichir sans le réécrire.

---

### Note pour Claude Code

Commencer par le design system et le `ThemeProvider` : ce sont les fondations du théming et des templates. Construire le moteur de rendu (`FieldRenderer` puis `FormExperience`) comme brique unique réutilisée partout (builder, public, aperçus de template) : un formulaire est une expérience web complète (couverture, sections, blocs de contenu, fin), pas une simple liste de champs. Respecter l'organisation par feature et la séparation état serveur (TanStack Query) / état UI (Zustand). Pour le design, **s'engager sur une direction esthétique forte et non générique** (§13) plutôt que de produire une UI passe-partout. Implémenter dans l'ordre de la section 14, une phase à la fois, en demandant confirmation entre les phases.
