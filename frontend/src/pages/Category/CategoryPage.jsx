import React, { useCallback, useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  const showMessage = useCallback((msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const response = await ApiService.getAllCategory();
      if (response.status === 200) {
        setCategories(response.categories);
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Error loading categories: " + error);
    }
  }, [showMessage]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = useMemo(() => {
    const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

    if (!normalizedSearch) {
      return categories;
    }

    return categories.filter((category) =>
      String(category.name || "").toLowerCase().includes(normalizedSearch)
    );
  }, [categories, searchTerm]);

  const addCategory = async () => {
    if (!categoryName.trim()) {
      showMessage("Category name cannot be empty");
      return;
    }
    try {
      await ApiService.createCategory({ name: categoryName.trim() });
      showMessage("Category successfully added");
      resetCategoryForm();
      await loadCategories();
    } catch (error) {
      showMessage(error.response?.data?.message || "Error adding category: " + error);
    }
  };

  const editCategory = async () => {
    if (!categoryName.trim()) {
      showMessage("Category name cannot be empty");
      return;
    }
    try {
      await ApiService.updateCategory(editingCategoryId, {
        name: categoryName.trim(),
      });
      showMessage("Category successfully updated");
      resetCategoryForm();
      await loadCategories();
    } catch (error) {
      showMessage(error.response?.data?.message || "Error updating category: " + error);
    }
  };

  const handleEditCategory = (category) => {
    setIsEditing(true);
    setEditingCategoryId(category.id);
    setCategoryName(category.name);
    setShowCategoryForm(true);
  };

  const resetCategoryForm = () => {
    setCategoryName("");
    setIsEditing(false);
    setEditingCategoryId(null);
    setShowCategoryForm(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await ApiService.deleteCategory(categoryId);
        showMessage("Category successfully deleted");
        await loadCategories();
      } catch (error) {
        showMessage(error.response?.data?.message || "Error deleting category: " + error);
      }
    }
  };

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}
      <div className="category-page manager-entity-page">
        <div className="manager-page-shell">
          <div className="manager-page-banner">
            <div>
              <span className="manager-page-eyebrow">Catalog</span>
              <h1>Categories</h1>
              <p className="page-subtitle">Search, add, edit, and remove product categories.</p>
            </div>
          </div>

          <div className="manager-page-card">
            <div className="page-toolbar manager-inline-toolbar">
              <input
                className="page-search-input"
                value={searchTerm}
                type="text"
                placeholder="Search categories"
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <button type="button" onClick={() => setShowCategoryForm((currentValue) => !currentValue)}>
                {showCategoryForm && !isEditing ? "Hide Form" : "Add Category"}
              </button>
            </div>
          </div>

          {showCategoryForm ? (
            <div className="category-entry-card manager-page-card">
              <div className="add-cat manager-inline-toolbar">
                <input
                  value={categoryName}
                  type="text"
                  placeholder="Category name"
                  onChange={(event) => setCategoryName(event.target.value)}
                />

                {!isEditing ? (
                  <button onClick={addCategory}>Save Category</button>
                ) : (
                  <button onClick={editCategory}>Update Category</button>
                )}

                <button type="button" className="secondary-page-button" onClick={resetCategoryForm}>
                  Cancel
                </button>
              </div>
            </div>
          ) : null}

          {filteredCategories.length ? (
            <ul className="category-list manager-entity-list">
              {filteredCategories.map((category) => (
                <li className="category-item manager-entity-item" key={category.id}>
                  <div>
                    <strong>{category.name}</strong>
                    <p>Used to organize the warehouse catalog and product grouping.</p>
                  </div>

                  <div className="category-actions manager-entity-actions">
                    <button onClick={() => handleEditCategory(category)}>Edit</button>
                    <button onClick={() => handleDeleteCategory(category.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="page-empty-state">
              <strong>No categories found</strong>
              <p>Try another search term or create a new category.</p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default CategoryPage;
