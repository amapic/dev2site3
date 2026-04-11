#!/usr/bin/env python3
import argparse
import json
from pathlib import Path
from urllib.parse import urlparse


WEB_DEV_KEYWORDS = {
    "html": 3,
    "css": 3,
    "javascript": 4,
    "typescript": 4,
    "react": 4,
    "nextjs": 4,
    "next.js": 4,
    "node": 3,
    "nodejs": 4,
    "vue": 3,
    "angular": 3,
    "svelte": 3,
    "tailwind": 4,
    "webpack": 3,
    "vite": 3,
    "frontend": 4,
    "backend": 4,
    "fullstack": 4,
    "api": 3,
    "rest": 2,
    "graphql": 3,
    "docker": 2,
    "github": 4,
    "gitlab": 3,
    "stackoverflow": 4,
    "stack overflow": 4,
    "mdn": 5,
    "devdocs": 5,
    "w3schools": 3,
    "freecodecamp": 4,
    "codepen": 4,
    "codesandbox": 4,
    "vercel": 3,
    "netlify": 3,
    "npm": 4,
    "pypi": 2,
    "docs": 2,
    "documentation": 3,
    "web dev": 5,
    "webdev": 5,
    "developer": 3,
    "programming": 2,
    "coding": 2,
}

JOB_KEYWORDS = {
    "offre",
    "offres",
    "emploi",
    "jobs",
    "job",
    "recrutement",
    "recrute",
    "hiring",
    "career",
    "careers",
    "vacancy",
    "vacancies",
    "stage",
    "alternance",
    "cdi",
    "cdd",
    "freelance",
    "mission",
    "job-mission",
    "indeed",
    "welcometothejungle",
    "linkedin/jobs",
}

TUTORIAL_OR_INSPI_KEYWORDS = {
    "tutorial",
    "tuto",
    "how to",
    "guide",
    "walkthrough",
    "course",
    "formation",
    "example",
    "examples",
    "exemple",
    "snippet",
    "boilerplate",
    "starter",
    "template",
    "inspiration",
    "inspi",
    "clone",
    "source code",
    "repo",
    "repository",
    "github.com/",
    "gitlab.com/",
    "/blob/",
    "/tree/",
    "youtube.com/watch",
    "youtu.be/",
    "codepen.io",
    "codesandbox.io",
}


def collect_bookmarks(node: dict, out: list[dict]) -> None:
    if node.get("type") == "url":
        url = node.get("url", "")
        if url.startswith("http://") or url.startswith("https://"):
            out.append(
                {
                    "name": (node.get("name") or "(sans nom)").strip(),
                    "url": url.strip(),
                }
            )
        return

    for child in node.get("children", []) or []:
        collect_bookmarks(child, out)


def read_bookmarks(bookmarks_path: Path) -> list[dict]:
    with bookmarks_path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    bookmarks: list[dict] = []
    for root in data.get("roots", {}).values():
        if isinstance(root, dict):
            collect_bookmarks(root, bookmarks)
    return bookmarks


def build_search_text(name: str, url: str) -> str:
    parsed = urlparse(url)
    host = parsed.netloc.replace("www.", " ")
    path = parsed.path.replace("/", " ")
    query = parsed.query.replace("=", " ").replace("&", " ")
    return f"{name} {host} {path} {query}".lower()


def score_bookmark(name: str, url: str) -> tuple[int, list[str]]:
    text = build_search_text(name, url)
    score = 0
    reasons: list[str] = []

    for keyword, points in WEB_DEV_KEYWORDS.items():
        if keyword in text:
            score += points
            reasons.append(keyword)

    if urlparse(url).netloc.endswith(".dev"):
        score += 2
        reasons.append("domaine .dev")

    return score, reasons


def is_job_offer(name: str, url: str) -> bool:
    text = build_search_text(name, url)
    return any(keyword in text for keyword in JOB_KEYWORDS)


def is_tutorial_or_inspiration(name: str, url: str) -> bool:
    normalized_text = build_search_text(name, url)
    raw_text = f"{name} {url}".lower()
    return any(
        keyword in normalized_text or keyword in raw_text
        for keyword in TUTORIAL_OR_INSPI_KEYWORDS
    )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Trouve les favoris Chrome les plus susceptibles d'etre des sites de dev web."
    )
    parser.add_argument(
        "--profile",
        default="Default",
        help="Nom du profil Chrome (ex: Default, Profile 1)",
    )
    parser.add_argument(
        "--user-data-dir",
        default=None,
        help="Chemin de Chrome User Data (sinon detection auto Windows)",
    )
    parser.add_argument(
        "--top",
        type=int,
        default=10,
        help="Nombre max de resultats a afficher",
    )
    parser.add_argument(
        "--min-score",
        type=int,
        default=3,
        help="Score minimum pour garder un favori",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Affiche le resultat en JSON",
    )
    parser.add_argument(
        "--include-jobs",
        action="store_true",
        help="Inclut les favoris detectes comme offres d'emploi",
    )
    parser.add_argument(
        "--include-tutorials",
        action="store_true",
        help="Inclut les favoris detectes comme tuto/inspi/exemple/source code",
    )
    args = parser.parse_args()

    if args.user_data_dir:
        user_data = Path(args.user_data_dir)
    else:
        user_data = Path.home() / "AppData" / "Local" / "Google" / "Chrome" / "User Data"

    profile_dir = user_data / args.profile
    bookmarks_path = profile_dir / "Bookmarks"

    if not bookmarks_path.exists():
        print(f"Introuvable: {bookmarks_path}")
        return 1

    bookmarks = read_bookmarks(bookmarks_path)
    ranked = []
    for bm in bookmarks:
        if not args.include_jobs and is_job_offer(bm["name"], bm["url"]):
            continue
        if not args.include_tutorials and is_tutorial_or_inspiration(
            bm["name"], bm["url"]
        ):
            continue
        score, reasons = score_bookmark(bm["name"], bm["url"])
        if score >= args.min_score:
            ranked.append(
                {
                    "name": bm["name"],
                    "url": bm["url"],
                    "score": score,
                    "reasons": sorted(set(reasons)),
                }
            )

    ranked.sort(key=lambda x: (-x["score"], x["name"].lower(), x["url"]))
    ranked = ranked[: max(args.top, 1)]

    if args.json:
        print(json.dumps(ranked, ensure_ascii=False, indent=2))
        return 0

    if not ranked:
        print("Aucun favori fortement associe au dev web n'a ete trouve.")
        print("Essaie avec --min-score 1 pour etre plus permissif.")
        return 0

    print("Favoris Chrome les plus probables pour un dev web:\n")
    for i, item in enumerate(ranked, start=1):
        print(f"{i}. {item['name']}")
        print(f"   URL: {item['url']}")
        print(f"   Score: {item['score']}")
        print(f"   Indices: {', '.join(item['reasons'])}")
        print()

    print("Astuce: mets --json pour exploiter le resultat dans un autre script.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
