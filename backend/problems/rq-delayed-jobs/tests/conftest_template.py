import fakeredis
import redis as redis_module

# Shared in-memory server so all Redis(db=N) calls share data
_server = fakeredis.FakeServer()

class _FakeRedis(fakeredis.FakeRedis):
    def __init__(self, host="localhost", port=6379, db=0, **kw):
        kw.pop("decode_responses", None)
        super().__init__(server=_server, db=db, **kw)

redis_module.Redis = _FakeRedis
redis_module.StrictRedis = _FakeRedis

# Patch rq.Worker → rq.SimpleWorker so jobs run in-process (no fork).
# Fork-based execution doesn't work with in-memory fakeredis because
# the child process gets a copy-on-write snapshot and results are lost.
import rq
import rq.worker
rq.Worker = rq.worker.SimpleWorker
rq.worker.Worker = rq.worker.SimpleWorker
