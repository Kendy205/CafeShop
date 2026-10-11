using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.DTO.Product.Requests;
using CafeShop.DTO.Product.Responses;
using CafeShop.DTO.User;
using CafeShop.DTO.Order.Requests;
using CafeShop.DTO.Order.Responses;
using CafeShop.DTO.Shipping;
using CafeShop.DTO.Dashboard.Requests;
using CafeShop.DTO.Dashboard.Responses;
using CafeShop.Model;
using CafeShop.Service.IService.Admin;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Admin
{
    public class AdminCategoryService : IAdminCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;

        public AdminCategoryService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _unitOfWork.Category.GetAllAsync();
        }

        public async Task<Category> GetByIdAsync(int id)
        {
            return await _unitOfWork.Category.GetFirstOrDefaultAsync(c => c.CategoryId == id);
        }

        public async Task<Category> AddAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description
            };
            await _unitOfWork.Category.AddAsync(category);
            await _unitOfWork.SaveAsync();
            return category;
        }

        public async Task<Category> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _unitOfWork.Category.GetFirstOrDefaultAsync(c => c.CategoryId == id);
            if (category != null)
            {
                category.Name = dto.Name;
                category.Description = dto.Description;
                _unitOfWork.Category.Update(category);
                await _unitOfWork.SaveAsync();
            }
            return category;
        }

        public async Task DeleteAsync(int id)
        {
            var category = await _unitOfWork.Category.GetFirstOrDefaultAsync(c => c.CategoryId == id);
            if (category != null)
            {
                _unitOfWork.Category.Remove(category);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
