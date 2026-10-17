using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Category.Requests;
using CafeShop.DTO.Category.Responses;
using CafeShop.Model;
using CafeShop.Service.IService.Admin;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Admin
{
    public class AdminCategoryService : IAdminCategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public AdminCategoryService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<List<CategoryDto>> GetAllAsync()
        {
            var categories = await _unitOfWork.Category.GetAllAsync();
            return _mapper.Map<List<CategoryDto>>(categories);
        }

        public async Task<CategoryDto?> GetByIdAsync(int id)
        {
            var category = await _unitOfWork.Category.GetFirstOrDefaultAsync(c => c.CategoryId == id);
            return category == null ? null : _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto> AddAsync(CreateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                Description = dto.Description
            };
            await _unitOfWork.Category.AddAsync(category);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<CategoryDto>(category);
        }

        public async Task<CategoryDto?> UpdateAsync(int id, UpdateCategoryDto dto)
        {
            var category = await _unitOfWork.Category.GetFirstOrDefaultAsync(c => c.CategoryId == id);
            if (category == null) return null;

            category.Name = dto.Name;
            category.Description = dto.Description;
            _unitOfWork.Category.Update(category);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<CategoryDto>(category);
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
