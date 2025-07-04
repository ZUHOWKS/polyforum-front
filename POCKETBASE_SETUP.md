# PocketBase Setup Instructions

## 1. First, make sure PocketBase is running:

```bash
cd /home/joris/dev/projects/poly-forum/pocketbase
./pocketbase serve
```

## 2. Open the PocketBase Admin UI:

- Go to: http://127.0.0.1:8090/_/
- Create an admin account if you haven't already

## 3. Create the Collections:

### Users Collection (should exist by default)

- Name: `users`
- Type: `auth`
- Fields should include:
  - `email` (email, required)
  - `name` (text, required)
  - `password` (password, required)

### Posts Collection

- Name: `posts`
- Type: `base`
- Fields to create:
  - `title` (text, required)
  - `content` (text, required)
  - `author` (relation to users, required)

### Messages Collection

- Name: `messages`
- Type: `base`
- Fields to create:
  - `content` (text, required)
  - `author` (relation to users, required)
  - `post` (relation to posts, required)

## 4. API Rules for Posts Collection:

Set these rules in the PocketBase admin:

**List/Search Rule:**

```javascript
// Allow everyone to read posts (including visitors)
"";
```

**View Rule:**

```javascript
// Allow everyone to view individual posts
"";
```

**Create Rule:**

```javascript
// Allow authenticated users to create posts
@request.auth.id != "" && @request.auth.id = @request.data.author
```

**Update Rule:**

```javascript
// Allow only the author to update their posts
@request.auth.id != "" && @request.auth.id = author
```

**Delete Rule:**

```javascript
// Allow only the author to delete their posts
@request.auth.id != "" && @request.auth.id = author
```

## 5. API Rules for Users Collection:

**List/Search Rule:**

```javascript
// Allow authenticated users to list users (for author names)
@request.auth.id != ""
```

**View Rule:**

```javascript
// Allow authenticated users to view user profiles
@request.auth.id != ""
```

## 6. API Rules for Messages Collection:

**List/Search Rule:**

```javascript
// Allow everyone to read messages (for visitors)
"";
```

**View Rule:**

```javascript
// Allow everyone to view individual messages
"";
```

**Create Rule:**

```javascript
// Allow authenticated users to create messages
@request.auth.id != "" && @request.auth.id = @request.data.author
```

**Update Rule:**

```javascript
// Allow only the author to update their messages
@request.auth.id != "" && @request.auth.id = author
```

**Delete Rule:**

```javascript
// Allow only the author to delete their messages
@request.auth.id != "" && @request.auth.id = author
```

## 7. Test the setup:

After setting up the collections and rules, test the application:

1. Start PocketBase: `./pocketbase serve`
2. Start Angular: `ng serve`
3. Go to: http://localhost:4200/auth
4. Register a new user
5. Create some posts
6. Verify that author names are displayed properly

## Common Issues:

- If author names don't appear, check the relation field in posts collection
- If you get permission errors, verify the API rules are set correctly
- Make sure the `author` field in posts is a relation to the `users` collection
