using AutoMapper;
using CafeShop.Data.Repository.UnitOfWork;
using CafeShop.DTO.Topping;
using CafeShop.Model;
using CafeShop.Service.IService.Admin;
using CafeShop.Service.IService;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace CafeShop.Service.Service.Admin
{
    public class AdminToppingService : IAdminToppingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;

        public AdminToppingService(IUnitOfWork unitOfWork, IMapper mapper, IPhotoService photoService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
        }

        public async Task<List<ToppingDto>> GetAllToppingsAsync()
        {
            var toppings = await _unitOfWork.Topping.GetAllAsync();
            return _mapper.Map<List<ToppingDto>>(toppings);
        }

        public async Task<Topping> GetByIdAsync(int id)
        {
            return await _unitOfWork.Topping.GetFirstOrDefaultAsync(p => p.ToppingId == id);
        }

        public async Task<ToppingDto> CreateToppingAsync(CreateUpdateToppingDto request)
        {
            var topping = _mapper.Map<Topping>(request);
            
            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(request.ImageFile);
                if (uploadResult.Error != null)
                    throw new Exception($"Lỗi tải ảnh lên hệ thống: {uploadResult.Error.Message}");
                    
                topping.ImageUrl = uploadResult.SecureUrl.AbsoluteUri;
            }

            await _unitOfWork.Topping.AddAsync(topping);
            await _unitOfWork.SaveAsync();
            return _mapper.Map<ToppingDto>(topping);
        }

        public async Task<ToppingDto> UpdateToppingAsync(int id, CreateUpdateToppingDto request)
        {
            var topping = await _unitOfWork.Topping.GetFirstOrDefaultAsync(t => t.ToppingId == id);
            if (topping == null) throw new ArgumentException("Không tìm thấy Topping!");

            _mapper.Map(request, topping);

            if (request.ImageFile != null && request.ImageFile.Length > 0)
            {
                var uploadResult = await _photoService.AddPhotoAsync(request.ImageFile);
                if (uploadResult.Error != null)
                    throw new Exception($"Lỗi tải ảnh lên hệ thống: {uploadResult.Error.Message}");
                    
                topping.ImageUrl = uploadResult.SecureUrl.AbsoluteUri;
            }

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

        public async Task DeleteAsync(int id)
        {
            var entity = await _unitOfWork.Topping.GetFirstOrDefaultAsync(p => p.ToppingId == id);
            if (entity != null)
            {
                _unitOfWork.Topping.Remove(entity);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
