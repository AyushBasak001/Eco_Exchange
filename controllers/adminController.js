export const renderAdminPage = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect("/auth");
    }
    const { username } = req.user;

    return res.status(200).render("adminDashboard.ejs", {username});

  } catch (err) {
    console.error("GET /admin error:", err.message);

    return res.status(500).send("Internal server error");
  }
}

export const manageUsers = async (req,res) => {
    try {
        return res.status(200).render("manageUsers.ejs");

    } catch (err) {
        console.error("GET /admin/users error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageProducts = async (req,res) => {
    try {
        return res.status(200).render("manageProducts.ejs");

    } catch (err) {
        console.error("GET /admin/products error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageOrders = async (req,res) => {
    try {
        return res.status(200).render("manageOrders.ejs");

    } catch (err) {
        console.error("GET /admin/orders error:", err.message);

        return res.status(500).send("Internal server error");
    }
}

export const manageAdminProfile = async (req,res) => {
    try {
        return res.status(200).render("manageAdminProfile.ejs");

    } catch (err) {
        console.error("GET /admin/profile error:", err.message);

        return res.status(500).send("Internal server error");
    }
}