Postgres.Projections
====================

A new tool for utilizing Postgresql's Json type support to support a CQRS style of architecture as an EventStore with support for user defined projections. 

The proposed deliverables are:

1. An npm package for defining and performing readside projections
1. Pre-built database schema objects for the event storage and PLV8 functions to lutilize the projection support
1. A command line tool -- probably written w/ Node.js -- for build and deployment tasks
1. An interactive tool to act as a "repl" for the projections for interactive simulation of the projection definitions
1. A second npm package to be a client for the Postgres event store and projection support




## Concept

* Exploit the Json support in Postgresql as an event store
* Expose a declarative DSL in plain jane Javascript to model how to configure readside _projections_ of the event data
* Offload most of the projections work to Javascript so that the the projection support could be _mobile_ and be executed in either a Node.js process, using the PLV8 support in Postgresql, or inside any type of application that allows you to embed Javascript.
* Support projections that are updated synchronously as events are captured, asynchronously for eventual concurrency, or calculated live upon client demand.

Postgresql's (PS) JSON datatype allows you to efficiently store, retrieve, and query against Json structures. Add in its general robustness and proven record in production and we have a strong candidate for usage as the backing event store in a CQRS architecture and a quasi-document database to boot.

## JSON in Postgresql

Beyond acting as a simple event store, we also want to exploit Postgresql to execute and build readside projections against events. The idea being that when an event is persisted to the events table PS would use database triggers to create or update readside projections of the event data. Fortunately, PS has support for asynchronous pub/sub communication in its sproc capabilities, so we could specify synchronous or async projections on a case by case basis. 

