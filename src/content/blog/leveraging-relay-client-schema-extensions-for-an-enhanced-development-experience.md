---
title:
  "Leveraging Relay Client Schema Extensions for an Enhanced Development
  Experience"
description:
  "Leveraging Relay Client Schema Extensions for an Enhanced Development
  Experience"
pubDate: "June 27 2025"
---

I recently started working on a "green field" React project at work. As can
happen sometimes, the API wasn’t ready yet. Rather than blocking development or
relying on ad-hoc mocks, I wanted a way to scaffold realistic, type-safe data
structures that would integrate seamlessly with Relay. That’s where
[Relay's Client Schema Extensions](https://relay.dev/docs/guided-tour/updating-data/client-only-data)
came in.

Client Schema Extensions allow you to extend your GraphQL schema with
client-only types and fields. This lets you mock data in a way that feels native
to your app without giving up the benefits of strict typing and schema
consistency. Instead of relying on plain JavaScript objects, one can structure
their application around queries and fragments, providing a schema-aware,
composable data model that gets one significantly closer to a fully working app
well before the API is ready.

## Our Client Schema Implementation

The Client Schema I created extends the server schema `User` type with a
client-only `UserProfile` type:

```graphql
type UserProfile implements Node & HasAvatar {
  IsMock: Boolean!
  id: GlobalID!
  avatar: String
  contactInfo: ContactInfo!
  firstName: String!
  lastName: String!
  joinedAt: DateTime!
}

extend type User {
  profile: UserProfile!
}
```

This creates a client-side data model that mirrors our server-side structure
while adding the `IsMock` flag to distinguish client-generated data.

## Client Data Population Strategy

To populate the data, we use a `<ClientData>` component that leverages Relay's
[`commitLocalUpdate`](https://relay.dev/docs/guided-tour/updating-data/local-data-updates/)
to inject mock records into the Relay store. Using `@faker-js/faker`, we can
generate realistic fake data without needing a live backend.

```jsx
function ClientData({ children }: { children: ReactNode }) {
  const environment = useRelayEnvironment();

  useEffect(() => {
    commitLocalUpdate(environment, store => {
      const id = uuidv4();
      const userId = `client:UserProfile:${id}`;
      const user = store.create(userId, 'UserProfile');

      user.setValue(userId, 'id');
      user.setValue(true, 'isMock');
      user.setValue(faker.image.avatar(), 'avatar');
      user.setValue(faker.name.firstName(), 'firstName');
      user.setValue(faker.name.lastName(), 'lastName');
      user.setValue(new Date().toISOString(), 'joinedAt');
    });
  }, [environment]);

  return <>{children}</>;
}
```

The `ContactInfo` type already exists in our server schema and is used
throughout the application. It’s a structured type with nested lists.

```graphql
type ContactInfo {
  addresses: [Address!]!
  phoneNumbers: [PhoneNumber!]!
  email: [Email!]!
}
```

While Client Schema Extensions let us mock data even when the API isn’t ready,
working directly with Relay’s store can be tricky. It’s powerful, but the
low-level APIs for creating records and wiring up links require a lot of
boilerplate and careful attention to detail. Mocking something like
`ContactInfo` manually using `commitLocalUpdate` can get tedious.

To simplify this, I used Cursor to generate the store update logic for me. With
both my client and server schema in context, the following prompt in Cursor
saved me time and ensured that my mocks were closely aligned with how the real
data would look:

> Generate a commitLocalUpdate block for Relay that creates a UserProfile record
> with a linked ContactInfo record. The ContactInfo should include:
>
> - One Address with street, city, state, postalCode, and country
> - Two PhoneNumber records with label and number
> - One Email with label and address
>
> Use faker to populate the values. Assume client IDs are generated using
> uuidv4() and the Relay environment is available. The goal is to mock the data
> structure defined in the schema and link all records properly.

The ensuing headache from writing Relay store update code for 30 minutes has
been successfully averted.

## Accessing Mock Data via Relay Fragments

With the mocked `UserProfile` and `ContactInfo` now present in the Relay store,
I can build real components against it. Here’s a simple `<Addresses>` component
that reads the mock data using a fragment and renders the user’s addresses.

```jsx
export default function Addresses({ contactInfoRef }: Props) {
  const data = useFragment(
    graphql`
      fragment AddressesFragment on ContactInfo {
        addresses {
          id
          street
          city
          state
          postalCode
          country
        }
      }
    `,
    contactInfoRef
  );

  // render addresses
}
```

In the past, I couldn't write fragments up front because the data didn't exist
yet. I used plain JavaScript objects which meant that I had to circle back and
wire everything up later (often weeks after the initial work) leading to
fragmented focus and unnecessary rework.

## Client-Driven API Design

An unexpected benefit of using a client schema like this is that it can act as a
API contract. By defining the shape of the data we expect (complete with nested
fields, IDs, and lists) we give backend engineers a clear blueprint for what the
frontend needs. This isn’t just helpful for mocking; it becomes a form of
collaboration. Instead of waiting for a spec doc or relying on vague handoffs,
we can point to the client schema and say: “Build this.” It keeps everyone
aligned and accelerates backend implementation by making expectations explicit
and concrete.

## Conclusion

Relay Client Schema Extensions are more than just a convenient workaround when
the backend isn't ready. They offer a practical way to keep momentum on the
frontend, even when the API is still in flux. With them, you can build real
components, validate assumptions early, and create a shared understanding of the
data model. By treating your client schema as both a development scaffold and an
API contract, you reduce ambiguity, speed up iteration, and bring frontend and
backend into better alignment.
