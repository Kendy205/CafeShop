using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Topping;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;
using System.Collections.Generic;
using System.Threading.Tasks;

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
            return await _unitOfWork.Topping.GetFirstOrDefaultAsync(p=>p.ToppingId==id);
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
            var entity = await _unitOfWork.Topping.GetFirstOrDefaultAsync(p => p.ToppingId == id);
            if (entity != null)
            {
                _unitOfWork.Topping.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
        public async Task<List<ToppingDto>> GetAllToppingsAsync(bool onlyAvailable = false)
        {
            var toppings = await _unitOfWork.Topping.GetAllAsync(
                filter: t => !onlyAvailable || t.IsAvailable
            );
            return _mapper.Map<List<ToppingDto>>(toppings);
        }

        public async Task<ToppingDto> CreateToppingAsync(CreateUpdateToppingDto request)
        {
            var topping = _mapper.Map<Topping>(request);
            await _unitOfWork.Topping.AddAsync(topping);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<ToppingDto>(topping);
        }

        public async Task<ToppingDto> UpdateToppingAsync(int id, CreateUpdateToppingDto request)
        {
            var topping = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == id);
            if (topping == null) throw new ArgumentException("Không tìm thấy Topping!");

            _mapper.Map(request, topping);
            _unitOfWork.Topping.Update(topping);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<ToppingDto>(topping);
        }

        public async Task ToggleAvailabilityAsync(int id)
        {
            var topping = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == id);
            if (topping == null) throw new ArgumentException("Không tìm thấy Topping!");

            topping.IsAvailable = !topping.IsAvailable;
            _unitOfWork.Topping.Update(topping);
            await _unitOfWork.SaveAsync();
        }
    }
}
