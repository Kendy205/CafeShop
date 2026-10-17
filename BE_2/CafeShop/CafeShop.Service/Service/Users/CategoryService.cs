using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Category.Responses;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
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
            var category = await _unitOfWork.Category.GetFirstOrDefaultAsync(p => p.CategoryId == id);
            return category == null ? null : _mapper.Map<CategoryDto>(category);
        }
    }
}
