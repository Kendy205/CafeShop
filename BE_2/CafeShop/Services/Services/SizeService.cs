using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class SizeService : ISizeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public SizeService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<Size>> GetAllAsync()
        {
            return await _unitOfWork.Size.GetAllAsync();
        }

        public async Task<Size> GetByIdAsync(int id)
        {
            return await _unitOfWork.Size.GetByIdAsync(id);
        }

        public async Task AddAsync(Size entity)
        {
            await _unitOfWork.Size.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Size entity)
        {
            _unitOfWork.Size.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Size.GetByIdAsync(id);
            if (entity != null)
            {
                _unitOfWork.Size.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
