import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { fetcher } from "../../lib/fetcher";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ArrowLeft, Edit, Trash2, Save, X } from "lucide-react";
import { useAlert } from "../../provider/AlertProvider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export const MealDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const alert = useAlert();
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    carbohydrates: "",
    protein: "",
    fat: "",
    calories: "",
    ingredients: ""
  });

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/${id}`);
        setMeal(res.meal);
        setEditForm({
          name: res.meal.name || "",
          category: res.meal.category || "",
          carbohydrates: res.meal.carbohydrates ?? "",
          protein: res.meal.protein ?? "",
          fat: res.meal.fat ?? "",
          calories: res.meal.calories ?? "",
          ingredients: Array.isArray(res.meal.ingredients)
            ? res.meal.ingredients.join(", ")
            : res.meal.ingredients || ""
        });
      } catch (err) {
        setError(err.message || "Failed to fetch meal");
        alert.error({
          title: "Error",
          description: "Failed to fetch meal details",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMeal();
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/${id}`, {
        method: "DELETE"
      });
      alert.success({
        title: "Success",
        description: "Meal deleted successfully",
      });
      navigate("/nutrition");
    } catch (err) {
      alert.error({
        title: "Error",
        description: "Failed to delete meal",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      // Prepare the payload
      const payload = {
        ...editForm,
        ingredients: editForm.ingredients
          .split(",")
          .map(s => s.trim())
          .filter(Boolean), // remove empty strings
      };

      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Refresh the meal data
      const res = await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/${id}`);
      setMeal(res.meal);
      setIsEditing(false);
      alert.success({
        title: "Success",
        description: "Meal updated successfully",
      });
    } catch (err) {
      alert.error({
        title: "Error",
        description: "Failed to update meal",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleInputChange = (field, value) => {
    // For numeric fields, convert to number (allow empty string for controlled input)
    if (["calories", "carbohydrates", "protein", "fat"].includes(field)) {
      setEditForm(prev => ({
        ...prev,
        [field]: value === "" ? "" : Number(value)
      }));
    } else if (field === "ingredients") {
      // Store as a comma-separated string for editing, but convert to array on submit
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    } else {
      setEditForm(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Loading meal...</div>;
  if (error) return <div className="text-center py-8 text-destructive">{error}</div>;
  if (!meal) return <div className="text-center py-8 text-destructive">Meal not found.</div>;

  return (
    <div className="mx-auto px-6 py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/nutrition">Nutrition</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator/>
          <BreadcrumbItem>
            <BreadcrumbPage>{meal?.name || 'Meal Details'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-6 capitalize">{meal.name}</h1>

      {/* Image */}
      <div className="relative flex items-center justify-center mb-6 mx-auto rounded-xl shadow-md aspect-[4/3] max-w-3xl w-full  overflow-hidden">
        <img
          src={meal.image_url}
          alt={meal.name}
          className="object-contain w-full h-full"
        />
      </div>

      {/* Details Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Meal Details</h2>
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Food Name</Label>
              <Input
                id="name"
                value={editForm.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editForm.category}
                  onChange={(e) => handleInputChange("category", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="calories">Calories</Label>
                <Input
                  id="calories"
                  type="number"
                  value={editForm.calories}
                  onChange={(e) => handleInputChange("calories", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="carbohydrates">Carbohydrates (g)</Label>
                <Input
                  id="carbohydrates"
                  type="number"
                  step="0.01"
                  value={editForm.carbohydrates}
                  onChange={(e) => handleInputChange("carbohydrates", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="protein">Protein (g)</Label>
                <Input
                  id="protein"
                  type="number"
                  step="0.01"
                  value={editForm.protein}
                  onChange={(e) => handleInputChange("protein", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="fat">Fat (g)</Label>
                <Input
                  id="fat"
                  type="number"
                  step="0.01"
                  value={editForm.fat}
                  onChange={(e) => handleInputChange("fat", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="scanned">Scanned</Label>
                <Input
                  id="scanned"
                  value={new Date(meal.scanned_at).toLocaleString()}
                  disabled
                />
              </div>
            </div>
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Input
                id="ingredients"
                value={editForm.ingredients}
                onChange={(e) => handleInputChange("ingredients", e.target.value)}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8 text-foreground text-sm border-b pb-4 mb-4">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Category</div>
              <div className="capitalize">{meal.category}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Calories</div>
              <div>{meal.calories}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Carbohydrates (g)</div>
              <div>{meal.carbohydrates}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Protein (g)</div>
              <div>{meal.protein}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Fat (g)</div>
              <div>{meal.fat}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-1">Scanned</div>
              <div>{new Date(meal.scanned_at).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Ingredients Section */}
      <h2 className="text-lg font-semibold mb-2">Ingredients</h2>
      <div className="text-foreground text-base mb-8 whitespace-pre-line">
        {isEditing ? (
          <Input
            id="ingredients"
            value={editForm.ingredients}
            onChange={(e) => handleInputChange("ingredients", e.target.value)}
          />
        ) : (
          Array.isArray(meal.ingredients)
            ? meal.ingredients.join(", ")
            : meal.ingredients
        )}
      </div>

      {/* Action Buttons at the Bottom */}
      <div className="flex flex-col md:flex-row gap-3 w-full max-w-3xl mx-auto">
        {isEditing ? (
          <>
            <Button
              onClick={handleUpdate}
              className="flex-1 flex items-center gap-1 cursor-pointer"
              disabled={isUpdating}
            >
              <Save size={16} />
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="flex-1 flex items-center gap-1 cursor-pointer"
            >
              <X size={16} />
              Cancel
            </Button>
          </>
        ) : showDeleteConfirm ? (
          <>
            <Button
              onClick={handleDelete}
              variant="destructive"
              className="flex-1 flex items-center gap-1 cursor-pointer"
              disabled={isDeleting}
            >
              <Trash2 size={16} />
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(false)}
              variant="outline"
              className="flex-1 flex items-center gap-1 cursor-pointer"
            >
              <X size={16} />
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => setIsEditing(true)}
              className="flex-1 flex items-center gap-1 cursor-pointer"
            >
              <Edit size={16} />
              Edit
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
              className="flex-1 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={16} />
              Delete
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
