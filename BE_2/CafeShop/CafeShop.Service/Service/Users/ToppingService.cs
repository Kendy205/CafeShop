using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Topping;
using CafeShop.Model;
using CafeShop.Repositories.IRepository;
using CafeShop.Services.IServices;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using CafeShop.Service.IService;

namespace CafeShop.Services.Services
{
    public class ToppingService : IToppingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public ToppingService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
        }

        public async Task<IEnumerable<Topping>> GetAllAsync()
        {
            return await _unitOfWork.Topping.GetAllAsync(t => t.IsAvailable);
        }

        public async Task<Topping> GetByIdAsync(int id)
        {
            return await _unitOfWork.Topping.GetFirstOrDefaultAsync(p=>p.ToppingId==id);
        }

        public async Task<List<ToppingDto>> GetAllToppingsAsync(bool onlyAvailable = true)
        {
            var toppings = await _unitOfWork.Topping.GetAllAsync(
                filter: t => !onlyAvailable || t.IsAvailable
            );
            return _mapper.Map<List<ToppingDto>>(toppings);
        }
    }
}
