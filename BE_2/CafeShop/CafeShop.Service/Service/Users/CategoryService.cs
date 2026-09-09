using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.Model;

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

        public async Task<IEnumerable<Category>> GetAllAsync()
        {
            return await _unitOfWork.Category.GetAllAsync();
        }

        public async Task<Category> GetByIdAsync(int id)
        {
            return await _unitOfWork.Category.GetFirstOrDefaultAsync(p => p.CategoryId == id);
        }

        public async Task AddAsync(Category entity)
        {
            await _unitOfWork.Category.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Category entity)
        {
            _unitOfWork.Category.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Category.GetFirstOrDefaultAsync(p => p.CategoryId == id);
            if (entity != null)
            {
                _unitOfWork.Category.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
