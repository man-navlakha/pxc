import { ApiError, publicUser } from "./auth.js";
import { query } from "./db.js";

export async function findUserByUsername(username) {
  const result = await query(
    `SELECT u.id, u.username, u.email, u.role, u.profile_pic_url, u.created_at,
            COUNT(DISTINCT followers.follower_user_id) AS follower_count,
            COUNT(DISTINCT following.following_user_id) AS following_count
     FROM auth_users u
     LEFT JOIN auth_follows followers ON followers.following_user_id = u.id
     LEFT JOIN auth_follows following ON following.follower_user_id = u.id
     WHERE u.username = $1
     GROUP BY u.id
     LIMIT 1`,
    [String(username || "").trim().toLowerCase()]
  );

  const user = publicUser(result.rows[0]);
  if (!user) throw new ApiError(404, "User not found.");
  return user;
}

export async function searchUsers(term) {
  const search = `%${String(term || "").trim().toLowerCase()}%`;
  if (search.length < 3) return [];

  const result = await query(
    `SELECT id, username, email, role, profile_pic_url, created_at
     FROM auth_users
     WHERE username LIKE $1 OR email LIKE $1
     ORDER BY username ASC
     LIMIT 20`,
    [search]
  );

  return result.rows.map(publicUser);
}

export async function listFollowing(username) {
  const result = await query(
    `SELECT u.id, u.username, u.email, u.role, u.profile_pic_url, u.created_at
     FROM auth_follows f
     JOIN auth_users owner ON owner.id = f.follower_user_id
     JOIN auth_users u ON u.id = f.following_user_id
     WHERE owner.username = $1
     ORDER BY f.created_at DESC`,
    [String(username || "").trim().toLowerCase()]
  );

  return result.rows.map(publicUser);
}

export async function listFollowers(username) {
  const result = await query(
    `SELECT u.id, u.username, u.email, u.role, u.profile_pic_url, u.created_at
     FROM auth_follows f
     JOIN auth_users owner ON owner.id = f.following_user_id
     JOIN auth_users u ON u.id = f.follower_user_id
     WHERE owner.username = $1
     ORDER BY f.created_at DESC`,
    [String(username || "").trim().toLowerCase()]
  );

  return result.rows.map(publicUser);
}
