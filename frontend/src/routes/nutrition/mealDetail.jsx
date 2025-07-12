import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { fetcher } from "../../lib/fetcher";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CircleChevronLeft, Edit, Trash2, Save, X } from "lucide-react";
import { useAlert } from "../../provider/AlertProvider";

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
          carbohydrates: res.meal.carbohydrates || "",
          protein: res.meal.protein || "",
          fat: res.meal.fat || "",
          calories: res.meal.calories || "",
          ingredients: res.meal.ingredients || ""
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
      await fetcher(`${import.meta.env.VITE_BACKEND_URL}/api/nutrition/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(editForm)
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
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) return <div>Loading meal...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!meal) return <div>Meal not found.</div>;

  return (
    <div className="p-3">
      <div className="max-w-4xl mx-auto">
        <Card className="overflow-hidden relative">
          <div className="absolute top-4 left-4 z-10">
            <Link to="/nutrition">
              <CircleChevronLeft size={32} className="hover:text-gray-700 transition-colors cursor-pointer" />
            </Link>
          </div>
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {!isEditing && !showDeleteConfirm && (
              <>
                <Button
                  onClick={() => setIsEditing(true)}
                  size="sm"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Edit size={16} />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  size="sm"
                  variant="destructive"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={16} />
                  Delete
                </Button>
              </>
            )}
            {showDeleteConfirm && (
              <>
                <Button
                  onClick={handleDelete}
                  size="sm"
                  variant="destructive"
                  className="flex items-center gap-1 cursor-pointer"
                  disabled={isDeleting}
                >
                  <Trash2 size={16} />
                  {isDeleting ? "Deleting..." : "Confirm Delete"}
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(false)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <X size={16} />
                  Cancel
                </Button>
              </>
            )}
            {isEditing && (
              <>
                <Button
                  onClick={handleUpdate}
                  size="sm"
                  className="flex items-center gap-1 cursor-pointer"
                  disabled={isUpdating}
                >
                  <Save size={16} />
                  {isUpdating ? "Saving..." : "Save"}
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <X size={16} />
                  Cancel
                </Button>
              </>
            )}
          </div>
          
          <div className="w-full flex justify-center items-center mb-6">
            <img 
              src={meal.image_url} 
              alt={meal.name} 
              style={{ maxWidth: '100%', maxHeight: 400, height: 'auto', width: 'auto', display: 'block', borderRadius: '0.75rem' }}
            />
          </div>
          
          <div className="p-6">
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
              <div>
                <h1 className="text-2xl font-bold mb-4">{meal.name}</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">Category</h3>
                    <p className="text-gray-600">{meal.category}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Calories</h3>
                    <p className="text-gray-600">{meal.calories}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Carbohydrates (g)</h3>
                    <p className="text-gray-600">{meal.carbohydrates}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Protein (g)</h3>
                    <p className="text-gray-600">{meal.protein}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Fat (g)</h3>
                    <p className="text-gray-600">{meal.fat}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">Scanned</h3>
                    <p className="text-gray-600">{new Date(meal.scanned_at).toLocaleString()}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="font-semibold text-gray-800">Ingredients</h3>
                    <p className="text-gray-600">{meal.ingredients}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
