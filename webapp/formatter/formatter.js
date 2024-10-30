sap.ui.define([], function () {
    "use strict";

    return {
		getCategoryName: function (categoryId) {
            const categoriesModel = sap.ui.getCore().getModel("categories");
            const categoriesData = categoriesModel.getData();
            const category = categoriesData.find(category => category.CategoryID === categoryId);
            return category ? category.CategoryName : 'Bilinmiyor';
        },
        getColorName: function (colorId) {
            const colorsModel = sap.ui.getCore().getModel("colors");
            const colorsData = colorsModel.getData();
            const color = colorsData.find(color => color.ColorID === colorId);
            return color ? color.ColorName : 'Bilinmiyor';
        },
		getSizeName: function (sizeId) {
            const sizesModel = sap.ui.getCore().getModel("sizes");
            const sizesData = sizesModel.getData();
            const size = sizesData.find(size => size.SizeID === sizeId);
            return size ? size.SizeName : 'Bilinmiyor';
        },
		getSubCategoryName: function (subCategoryId) {
            const subCategoriesModel = sap.ui.getCore().getModel("subCategories");
            const subCategoriesData = subCategoriesModel.getData();
            const subCategory = subCategoriesData.find(subCategory => subCategory.SubCategoryID === subCategoryId);
            return subCategory ? subCategory.SubCategoryName : 'Bilinmiyor';
        }
    };
});
