import api from "@/lib/api";

export const login = async (email, password) => {
  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const register = async (userData) => {
  try {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  } catch (error) {
    console.error("Register failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await api.post("/api/auth/logout");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return response.data;
  } catch (error) {
    console.error("Logout failed:", error);
    throw error;
  }
};

export const getUserProfile = async (id) => {
  try {
    const response = await api.get(`/api/user/profile/${id}`);
    return response.data;
  } catch (error) {
    console.error("Get user profile failed:", error);
    throw error;
  }
};

export const updateProfile = async (id, data) => {
  try {
    const response = await api.patch(`/api/user/${id}/update-profile`, data);
    return response.data;
  } catch (error) {
    console.error("Update profile failed:", error);
    throw error;
  }
};

export const changePassword = async (id, data) => {
  try {
    const response = await api.patch(`/api/user/${id}/change-password`, data);
    return response.data;
  } catch (error) {
    console.error("Change password failed:", error);
    throw error;
  }
};

export const updateProfilePicture = async (userId, file) => {
  const formData = new FormData();
  formData.append("image", file); // Sesuaikan key "image" dengan backend Anda

  const response = await axios.post(`/api/user/${userId}/profile-picture`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getProfilePicture = async (id) => {
    try {
        const response = await api.get(`/api/user/${id}/profile-picture`);
        return response.data;
    }catch(err){
        console.log(err);
        throw err;
    }
}


export const uploadProfilePicture = async (userId, file) => {
  const formData = new FormData();
  formData.append("profile_picture", file); // Sesuaikan key ini dengan backend Anda

  const response = await api.post(`/api/user/${userId}/upload-profile-picture`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteprofile = async (id) => {
  try {
    const response = await api.delete(`/api/user/${id}/profile-picture`, {
    });
    return response.data; 
  } catch (error) {
    throw error;
  }
};