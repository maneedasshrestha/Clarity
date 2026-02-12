const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with anonymous key for backend operations
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing SUPABASE_URL environment variable");
}

if (!supabaseAnonKey) {
  throw new Error("Missing SUPABASE_ANON_KEY environment variable");
}

// Create Supabase client for backend operations with anon key
// This client respects Row Level Security (RLS) policies
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to create authenticated client for a specific user
const getAuthenticatedClient = (userToken) => {
  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    },
  });
  return authClient;
};

// Helper function to verify user from JWT token
const verifyUser = async (token) => {
  try {
    const authClient = getAuthenticatedClient(token);
    const {
      data: { user },
      error,
    } = await authClient.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

// Helper function to get user profile
const getUserProfile = async (userId, userToken = null) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    const { data, error } = await client
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to fetch user profile");
  }
};

// Helper function to create user profile
const createUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from("user_profiles")
      .insert({
        id: userId,
        ...profileData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to create user profile");
  }
};

// Helper function to update user profile
const updateUserProfile = async (userId, updates, userToken = null) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    const { data, error } = await client
      .from("user_profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to update user profile");
  }
};

// Transaction related functions
const getTransactions = async (userId, filters = {}, userToken = null) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    let query = client
      .from("transactions")
      .select(
        `
        *,
        categories (
          id,
          name,
          icon,
          color
        )
      `,
      )
      .eq("user_id", userId)
      .order("date", { ascending: false });

    // Apply filters
    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.category) {
      query = query.eq("category_name", filters.category);
    }
    if (filters.startDate) {
      query = query.gte("date", filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte("date", filters.endDate);
    }
    if (filters.search) {
      query = query.or(
        `description.ilike.%${filters.search}%,category_name.ilike.%${filters.search}%`,
      );
    }

    // Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 20) - 1,
      );
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to fetch transactions");
  }
};

const createTransaction = async (userId, transactionData, userToken = null) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    const { data, error } = await client
      .from("transactions")
      .insert({
        user_id: userId,
        ...transactionData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to create transaction");
  }
};

// Categories related functions
const getCategories = async (userId, type = null, userToken = null) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    let query = client
      .from("categories")
      .select("*")
      .or(`user_id.eq.${userId},is_default.eq.true`)
      .order("is_default", { ascending: false })
      .order("name");

    if (type) {
      query = query.eq("type", type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to fetch categories");
  }
};

// Goals related functions
const getGoals = async (userId, userToken = null) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    const { data, error } = await client
      .from("goals")
      .select(
        `
        *,
        goal_transactions (
          id,
          amount,
          date,
          description
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to fetch goals");
  }
};

const createGoal = async (userId, goalData, userToken = null) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    const { data, error } = await client
      .from("goals")
      .insert({
        user_id: userId,
        ...goalData,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to create goal");
  }
};

const addMoneyToGoal = async (
  userId,
  goalId,
  amount,
  description = null,
  userToken = null,
) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    const { data, error } = await client
      .from("goal_transactions")
      .insert({
        goal_id: goalId,
        user_id: userId,
        amount,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to add money to goal");
  }
};

// Analytics helper function
const getUserOverview = async (
  userId,
  monthDate = new Date(),
  userToken = null,
) => {
  try {
    const client = userToken ? getAuthenticatedClient(userToken) : supabase;
    const { data, error } = await client.rpc("get_user_overview", {
      user_uuid: userId,
      month_date: monthDate.toISOString().split("T")[0],
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to fetch user overview");
  }
};

module.exports = {
  supabase,
  getAuthenticatedClient,
  verifyUser,
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  getTransactions,
  createTransaction,
  getCategories,
  getGoals,
  createGoal,
  addMoneyToGoal,
  getUserOverview,
};
