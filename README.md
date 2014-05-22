Postgres.Projections
====================

A *spike* for utilizing Postgresql's Json type support for an event store backend w/ projections



## Concept

* Use Postgresql as an event store
* Expose a declarative DSL to model how to update the readside model from the events
* "Compile" the DSL into stored procedures, triggers, and tables for the defined projections
* The client API should be able to create the matching DDL on demand

Postgresql's (PS) JSON datatype allows you to efficiently store, retrieve, and query against Json structures. Add in its general robustness and proven record in production and we have a strong candidate for usage as the backing event store in a CQRS architecture and a quasi-document database to boot.

Beyond acting as a simple event store, we also want to exploit Postgresql to execute and build readside projections against events. The idea being that when an event is persisted to the events table PS would use database triggers to create or update readside projections of the event data. Fortunately, PS has support for asynchronous pub/sub communication in its sproc capabilities, so we could specify synchronous or async projections on a case by case basis. 



## What would it consist of?

Right off the bat, we'd have enough DDL to create an aggregate's and events table, with the events table holding the actual event as a Json blob. We'd also have a sproc (s) for appending new events to these two tables.


## Generating the Schema

I really want the application code to be able to spin up a brand new postgres schema on the fly to make application deployments, dev time work, and automated testing easier. 

## What am I worried about?

Will this thing scale? We're gonna be adding some load to the database here. Most of my career has been about getting functionality *out* of the database and into the application tier. This feels a little bit like Back to the Future.

Communicating whether or not a projection is up to date when we do async projections. The equivalent to RavenDb's WaitForNonStaleResults()

Receiving events out of sequence. 

Communicating exceptions and errors in building projections asynchronously



## Defining the Projections

### By Json metadata crunched by Sproc's

We've got a couple different choices. One thing I was kicking around yesterday was to define the Projection transforms and rules in Json, them push that Json metadata into sproc's that would create the real projection stored procedures. The only really good thing about that idea in my mind is that it keeps this functionality from being tightly coupled to the application programming language. Using Ruby inside of PS is an option.

### In Scala applications

Ideally, I'd like to have the projections defined in the application programming language. In a fubumvc-esque C# client we would use Expression's to model the projection. I'm not sure if we could easily get away from strings in Scala.

Maybe we could reverse engineer [Slick](http://slick.typesafe.com) if we're gonna be serious about this

### In CSharp

This would be relatively simple. We'd use a lot of Expression's and a new class scoped DSL holder to pull it off


aglksJF;LASKDJF;LKSDJF;LAKSDFJ;LAKSDFJasdf## Building the Schema

