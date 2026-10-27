# Aplikacija za bilješke (React Native Expo & Supabase)

Ovo je jednostavna mobilna i web aplikacija za rad s bilješkama izrađena pomoću **React Native (Expo)** okruženja i **Supabase** baze podataka u oblaku. 

Aplikacija omogućuje automatsku anonimnu prijavu korisnika, unos novih bilješki, njihovo trajno spremanje u bazu podataka te ponovno učitavanje prilikom otvaranja aplikacije.

---

## 🚀 Svrha projekta

Glavna svrha ove aplikacije je prikazati povezivanje React Native prednjeg dijela (frontend) s vanjskom PostgreSQL bazom i servisom za autentifikaciju (Supabase). 

Sigurnost podataka osigurana je na razini same baze putem **Row Level Security (RLS)** pravila – svaki korisnik ima pristup isključivo vlastitim bilješkama, čak i pri anonimnoj prijavi.

---

## 🛠️ Tehnologije i paketi

* **React Native / Expo** (Expo Router za navigaciju i prikaze)
* **Supabase** (Baza podataka u oblaku i autentifikacija)
* **`@supabase/supabase-js`** (Službeni Supabase klijent)
* **`@react-native-async-storage/async-storage`** (Lokalna pohrana korisničke sesije)
* **`react-native-url-polyfill`** (Podrška za URL funkcije unutar React Native okruženja)

---

## 📋 Preduvjeti i instalacija

### 1. Kloniranje / Preuzimanje projekta
Otvorite mapu projekta u terminalu (unutar Visual Studio Code-a).

### 2. Instalacija zavisnosti (packages)
Za instalaciju svih potrebnih paketa u terminalu pokrenite:

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

---

## 🗄️ Postavljanje baze podataka (Supabase)

1. Otvorite [Supabase Dashboard](https://supabase.com/dashboard) i izradite novi projekt `notes-app`.
2. Otvorite **SQL Editor** u Supabaseu i pokrenite sljedeći skript kako biste izradili tablicu i postavili sigurnosna pravila:

```sql
-- 1. Izrada tablice za bilješke
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id),
  content text not null
);

-- 2. Uključivanje sigurnosti na razini redaka (RLS)
alter table notes enable row level security;

-- 3. Dodjela dozvola za prijavljene korisnike
grant select, insert, update, delete on notes to authenticated;

-- 4. Sigurnosno pravilo: pristupa se samo vlastitim bilješkama
create policy "Samo vlastite bilješke"
on notes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

3. U Supabase postavkama (**Authentication -> Sign In / Providers -> Anonymous**) obavezno uključite opciju **Allow anonymous sign-ins**.

---

## 🔑 Postavljanje varijabli okruženja (`.env`)

U korijenu projekta (uz `package.json`) izradite `.env` datoteku te unesite svoje podatke iz Supabase postavki:

```env
EXPO_PUBLIC_SUPABASE_URL=vaš_supabase_project_url
EXPO_PUBLIC_SUPABASE_KEY=vaš_supabase_publishable_key
```

> ⚠️ **Napomena o sigurnosti:** Stvarna `.env` datoteka se **ne šalje** na GitHub repozitorij kako se ne bi javno izložili ključevi baze!

Za potrebe predaje projekta, u repozitorij je priložena predložak datoteka **`.env.example`**:

```env
EXPO_PUBLIC_SUPABASE_URL=OVDJE_ZALIJEPI_PROJECT_URL
EXPO_PUBLIC_SUPABASE_KEY=OVDJE_ZALIJEPI_PUBLISHABLE_KEY
```

---

## 💻 Pokretanje aplikacije

Aplikaciju u web pregledniku pokrećete naredbom:

```bash
npx expo start --web --clear
```

Nakon pokretanja, aplikacija će se otvoriti na adresi `http://localhost:8081` (ili drugom ponuđenom portu).

---

## 📁 Struktura ključnih datoteka

* **`lib/supabase.ts`**: Inicijalizacija i konfiguracija Supabase klijenta te upravljanje sesijom.
* **`src/app/index.tsx`**: Glavni zaslon aplikacije s logikom za učitavanje, unos i prikaz bilješki.
* **`.env`**: Lokalna konfiguracija s tajnim ključevima (izostavljena s GitHuba).
* **`.env.example`**: Primjer postavki za druge programere/profesora.
