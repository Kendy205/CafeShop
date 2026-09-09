using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;

namespace CafeShop.Services.Services
{
    public class ToppingService : IToppingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ToppingService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<IEnumerable<Topping>> GetAllAsync()
        {
            return await _unitOfWork.Topping.GetAllAsync();
        }

        public async Task<Topping> GetByIdAsync(int id)
        {
            return await _unitOfWork.Topping.GetByIdAsync(id);
        }

        public async Task AddAsync(Topping entity)
        {
            await _unitOfWork.Topping.AddAsync(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task UpdateAsync(Topping entity)
        {
            _unitOfWork.Topping.Update(entity);
            await _unitOfWork.SaveAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Topping.GetByIdAsync(id);
            if (entity != null)
            {
                _unitOfWork.Topping.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
