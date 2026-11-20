import json, random

def fmt(x):
    if isinstance(x, float):
        if abs(x - round(x)) < 1e-9: return str(int(round(x)))
        return ('%.2f' % x).rstrip('0').rstrip('.')
    return str(x)

def make_q(q, correct, wrongs, seed):
    correct = fmt(correct)
    opts = [correct]
    for w in wrongs:
        w = fmt(w)
        if w not in opts:
            opts.append(w)
    opts = opts[:4]
    while len(opts) < 4:
        opts.append(correct + " ")
    r = random.Random(seed)
    r.shuffle(opts)
    return {"q": q, "o": opts, "a": opts.index(correct)}

def build(subject, topics):
    """topics: list of (tid, title, icon, items) where items = [(q, correct, [wrongs])] * 10"""
    out = []
    for idx, (tid, title, icon, items) in enumerate(topics):
        assert len(items) == 10, f"{tid}: {len(items)} items"
        qs = [make_q(q, c, w, idx * 137 + i) for i, (q, c, w) in enumerate(items)]
        texts = [x["q"] for x in qs]
        assert len(set(texts)) == 10, f"{tid}: duplicate questions -> {[t for t in texts if texts.count(t)>1]}"
        out.append({"id": f"{subject}_{tid}", "title": title, "icon": icon,
                    "subject": subject, "questions": qs})
    return out